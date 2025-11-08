import { useState, useEffect } from 'react';
import { Card, Row, Col, Descriptions, Tabs, Table, Image, Button, Spin, message, Typography } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

const ProfileComponent = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  // Cargar toda la información del perfil
  const loadUserProfile = async () => {
    setLoading(true);
    await Promise.all([
      loadUserData(),
      loadUserProducts(),
      loadUserTransactions()
    ]);
    setLoading(false);
  };

  // 1. Cargar datos públicos del usuario
  const loadUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/users/${userId}`
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        message.error('Error al cargar datos del usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar datos del usuario');
    }
  };

  // 2. Cargar productos en venta del usuario
  const loadUserProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/products?sellerId=${userId}`,
        {
          headers: {
            'apikey': localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (response.ok) {
        const productsData = await response.json();
        
        // Añadir imagen a cada producto
        const productsWithImages = productsData.map(p => ({
          ...p,
          image: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/images/${p.id}.png`
        }));
        
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 3. Cargar transacciones del usuario
  const loadUserTransactions = async () => {
    try {
      const [purchasesRes, salesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?buyerId=${userId}`, {
          headers: {
            'apikey': localStorage.getItem('apiKey') || ''
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?sellerId=${userId}`, {
          headers: {
            'apikey': localStorage.getItem('apiKey') || '' 
          }
        })
      ]);

      if (purchasesRes.ok && salesRes.ok) {
        const purchasesData = await purchasesRes.json();
        const salesData = await salesRes.json();

        // Cargar info completa de productos para cada transacción
        const purchasesWithProducts = await loadTransactionProducts(purchasesData);
        const salesWithProducts = await loadTransactionProducts(salesData);

        setPurchases(purchasesWithProducts);
        setSales(salesWithProducts);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Función auxiliar para cargar productos de transacciones
  const loadTransactionProducts = async (transactions) => {
    return Promise.all(
      transactions.map(async (t) => {
        try {
          const productRes = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/products/${t.productId}`,
            {
              headers: {
                'apikey': localStorage.getItem('apiKey') || ''  // ← AÑADIR
              }
            }
          );
          const product = productRes.ok ? await productRes.json() : {};
          
          return {
            ...t,
            ...product,
            image: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/images/${t.productId}.png`
          };
        } catch {
          return t;
        }
      })
    );
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  // Columnas para tabla de productos
  const productsColumns = [
    {
      title: 'Imagen',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image, record) => (
        <Image
          src={image}
          alt={record.title}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="/imageMockup.png"
          preview={false}
        />
      ),
    },
    {
      title: 'Producto',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => <span style={{ fontWeight: 500 }}>€{price}</span>,
    },
    {
      title: 'Estado',
      key: 'status',
      width: 120,
      render: (_, record) => (
        record.buyerId ? 
          <Text type="danger">Vendido</Text> : 
          <Text type="success">Disponible</Text>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Link href={`/detailProduct/${record.id}`}>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  // Columnas para tabla de transacciones
  const transactionsColumns = [
    {
      title: 'Imagen',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image, record) => (
        <Image
          src={image}
          alt={record.title}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="/imageMockup.png"
          preview={false}
        />
      ),
    },
    {
      title: 'Producto',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => <span style={{ fontWeight: 500 }}>€{price}</span>,
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Link href={`/detailProduct/${record.productId}`}>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  // Items de tabs
  const tabItems = [
    {
      key: 'products',
      label: (
        <span>
          <ShoppingOutlined />
          Productos en venta ({products.filter(p => !p.buyerId).length})
        </span>
      ),
      children: (
        <Table
          columns={productsColumns}
          dataSource={products}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No tiene productos en venta' }}
        />
      )
    },
    {
      key: 'purchases',
      label: (
        <span>
          <ShoppingOutlined />
          Compras ({purchases.length})
        </span>
      ),
      children: (
        <Table
          columns={transactionsColumns}
          dataSource={purchases}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No ha realizado compras' }}
        />
      )
    },
    {
      key: 'sales',
      label: (
        <span>
          <DollarOutlined />
          Ventas ({sales.length})
        </span>
      ),
      children: (
        <Table
          columns={transactionsColumns}
          dataSource={sales}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No ha realizado ventas' }}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <Text type="danger">No se pudo cargar el perfil del usuario</Text>
      </Card>
    );
  }

  return (
    <div>
      <Title level={2}>
        <UserOutlined /> Perfil de Usuario
      </Title>

      {/* Datos públicos del usuario */}
      <Card style={{ marginBottom: 24 }}>
        <Descriptions title="Información Pública" bordered column={2}>
          <Descriptions.Item label="ID">#{user.id}</Descriptions.Item>
          <Descriptions.Item label="Nombre">{user.name || 'No especificado'}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="País">{user.country || 'No especificado'}</Descriptions.Item>
          <Descriptions.Item label="Código Postal" span={2}>
            {user.postalCode || 'No especificado'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tabs con productos y transacciones */}
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ProfileComponent;