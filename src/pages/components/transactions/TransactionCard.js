import { Card, Row, Col, Typography, Tag, Descriptions, Image, Button } from 'antd';
import { ShoppingOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const { Text, Title } = Typography;

export default function TransactionCard({ transaction, type, currentUserId }) {
  const [productInfo, setProductInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdditionalInfo();
  }, [transaction]);

  // Cargar información adicional si el backend no la incluye
  const loadAdditionalInfo = async () => {
    setLoading(true);

    // Verificar si el backend ya incluye la información del producto
    if (transaction.product) {
      setProductInfo(transaction.product);
    } else if (transaction.productId) {
      // Si no la incluye, cargarla
      await loadProductInfo(transaction.productId);
    }

    // Verificar si el backend ya incluye la información del usuario
    if (type === 'purchase' && transaction.seller) {
      setUserInfo(transaction.seller);
    } else if (type === 'sale' && transaction.buyer) {
      setUserInfo(transaction.buyer);
    } else {
      // Si no la incluye, cargarla
      const userId = type === 'purchase' ? transaction.sellerId : transaction.buyerId;
      if (userId) {
        await loadUserInfo(userId);
      }
    }

    setLoading(false);
  };

  // Cargar información del producto
  const loadProductInfo = async (productId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/products/${productId}`,
        {
          headers: {
            apikey: localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (response.ok) {
        const product = await response.json();
        
        // Verificar si la imagen existe
        const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/images/${product.id}.png`;
        const imageExists = await checkImageExists(imageUrl);
        product.image = imageExists ? imageUrl : '/imageMockup.png';
        
        setProductInfo(product);
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
    }
  };

  // Cargar información del usuario
  const loadUserInfo = async (userId) => {
    try {
      // Intenta cargar del endpoint /users/:id si existe
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/users/${userId}`,
        {
          headers: {
            apikey: localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (response.ok) {
        const user = await response.json();
        setUserInfo(user);
      } else {
        // Si no existe el endpoint, usar un placeholder
        setUserInfo({ id: userId, email: `Usuario #${userId}` });
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      setUserInfo({ id: userId, email: `Usuario #${userId}` });
    }
  };

  // Verificar si la imagen existe
  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  // Obtener el nombre de la categoría
  const getCategoryName = (categoryId) => {
    const categories = {
      'celulares': 'Celulares',
      'computadores': 'Computadores',
      'televisores': 'Televisores',
      'videojuegos': 'Videojuegos',
      'deportes': 'Deportes',
      'accesorios': 'Accesorios',
      'audio': 'Audio'
    };
    return categories[categoryId] || categoryId;
  };

  if (loading) {
    return <Card loading={true} />;
  }

  const isPurchase = type === 'purchase';
  const productTitle = productInfo?.title || 'Producto';
  const productImage = productInfo?.image || '/imageMockup.png';
  const productCategory = productInfo?.category;
  const otherUserEmail = userInfo?.email || userInfo?.firstName || `Usuario #${isPurchase ? transaction.sellerId : transaction.buyerId}`;

  return (
    <Card
      hoverable
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Columna de la imagen */}
        <Col xs={24} sm={6} md={4}>
          <Image
            src={productImage}
            alt={productTitle}
            style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
            preview={false}
          />
        </Col>

        {/* Columna de información principal */}
        <Col xs={24} sm={18} md={14}>
          <div>
            {/* Tipo de transacción */}
            <Tag 
              color={isPurchase ? 'blue' : 'green'} 
              icon={isPurchase ? <ShoppingOutlined /> : <DollarOutlined />}
              style={{ marginBottom: 8 }}
            >
              {isPurchase ? 'COMPRA' : 'VENTA'}
            </Tag>

            {/* Título del producto */}
            <Title level={4} style={{ margin: '8px 0' }}>
              {productTitle}
            </Title>

            {/* Descripción compacta */}
            <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
              <Descriptions.Item 
                label={<Text type="secondary">Precio</Text>}
              >
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  €{transaction.productPrice}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={<Text type="secondary">Fecha</Text>}
              >
                <Text>
                  <CalendarOutlined /> {formatDate(transaction.startDate)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={<Text type="secondary">{isPurchase ? 'Vendedor' : 'Comprador'}</Text>}
              >
                <Text>
                  <UserOutlined /> {otherUserEmail}
                </Text>
              </Descriptions.Item>

              {productCategory && (
                <Descriptions.Item 
                  label={<Text type="secondary">Categoría</Text>}
                >
                  <Tag color="blue">{getCategoryName(productCategory)}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </Col>

        {/* Columna de acciones */}
        <Col xs={24} sm={24} md={6} style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href={`/detailProduct/${transaction.productId}`}>
              <Button type="primary" block>
                Ver producto
              </Button>
            </Link>

            {/* Información adicional de dirección si existe */}
            {(transaction.buyerAddress || transaction.buyerCountry) && (
              <Card size="small" style={{ marginTop: 8, textAlign: 'left' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Envío:
                </Text>
                {transaction.buyerAddress && (
                  <div><Text style={{ fontSize: 12 }}>{transaction.buyerAddress}</Text></div>
                )}
                {transaction.buyerCountry && (
                  <div><Text style={{ fontSize: 12 }}>{transaction.buyerCountry}</Text></div>
                )}
                {transaction.buyerPostCode && (
                  <div><Text style={{ fontSize: 12 }}>CP: {transaction.buyerPostCode}</Text></div>
                )}
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}