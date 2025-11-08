import { useState, useEffect } from 'react';
import { Card, Tabs, Table, Tag, Button, Image, message, Typography } from 'antd';
import { ShoppingOutlined, DollarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

let ListTransactionsComponent = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    const userId = getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
      await loadTransactions();
    } else {
      message.warning('No se pudo obtener tu información de usuario');
      setLoading(false);
    }
  };

  // Obtener el ID del usuario actual
  const getCurrentUserId = () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        return parseInt(userId);
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo userId:', error);
      return null;
    }
  };

  // Cargar todas las transacciones del usuario
  const loadTransactions = async () => {
    setLoading(true);

    try {
      const userId = getCurrentUserId();
      
      // Hacer dos llamadas: una para compras y otra para ventas
      const [purchasesRes, salesRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?buyerId=${userId}`,
          { headers: { apikey: localStorage.getItem('apiKey') || '' } }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?sellerId=${userId}`,
          { headers: { apikey: localStorage.getItem('apiKey') || '' } }
        )
      ]);

      if (purchasesRes.ok && salesRes.ok) {
        const purchasesData = await purchasesRes.json();
        const salesData = await salesRes.json();
        
        // Combinar ambas
        const allData = [...purchasesData, ...salesData];
        
        // Cargar info completa de cada transacción
        const transactionsWithFullInfo = await Promise.all(
          allData.map(async (t) => {
            // Obtener info del producto
            const productRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/products/${t.productId}`,
              { headers: { apikey: localStorage.getItem('apiKey') || '' } }
            );
            const product = productRes.ok ? await productRes.json() : {};
            
            return {
              ...t,
              ...product,
              tid: t.id,
              image: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/images/${t.productId}.png`
            };
          })
        );
        
        setAllTransactions(transactionsWithFullInfo);
        
        const myPurchases = transactionsWithFullInfo.filter(t => t.buyerId === userId);
        const mySales = transactionsWithFullInfo.filter(t => t.sellerId === userId);
        
        setPurchases(myPurchases);
        setSales(mySales);
      } else {
        message.error('Error al cargar las transacciones');
      }

    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  // Columnas para la tabla de COMPRAS
  const purchasesColumns = [
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
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {record.description.substring(0, 50)}
              {record.description.length > 50 ? '...' : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Precio',
      dataIndex: 'productPrice',
      key: 'productPrice',
      width: 100,
      render: (price) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          €{price}
        </span>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Vendedor',
      dataIndex: 'sellerId',
      key: 'sellerId',
      width: 150,
      render: (sellerId) => (
        <Link href={`/profile/${sellerId}`}>
          <Button type="link" size="small" icon={<UserOutlined />}>
            Usuario #{sellerId}
          </Button>
        </Link>
      ),
    },
    {
      title: 'Dirección de envío',
      key: 'address',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.buyerAddress && <div>{record.buyerAddress}</div>}
          {record.buyerCountry && <div>{record.buyerCountry}</div>}
          {record.buyerPostCode && <div>CP: {record.buyerPostCode}</div>}
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Link href={`/detailProduct/${record.productId}`}>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  // Columnas para la tabla de VENTAS
  const salesColumns = [
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
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {record.description.substring(0, 50)}
              {record.description.length > 50 ? '...' : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Precio',
      dataIndex: 'productPrice',
      key: 'productPrice',
      width: 100,
      render: (price) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>
          €{price}
        </span>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Comprador',
      dataIndex: 'buyerId',
      key: 'buyerId',
      width: 150,
      render: (buyerId) => (
        <Link href={`/profile/${buyerId}`}>
          <Button type="link" size="small" icon={<UserOutlined />}>
            Usuario #{buyerId}
          </Button>
        </Link>
      ),
    },
    {
      title: 'Enviar a',
      key: 'address',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.buyerAddress && <div>{record.buyerAddress}</div>}
          {record.buyerCountry && <div>{record.buyerCountry}</div>}
          {record.buyerPostCode && <div>CP: {record.buyerPostCode}</div>}
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Link href={`/detailProduct/${record.productId}`}>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  // Tabs items
  const tabItems = [
    {
      key: 'purchases',
      label: (
        <span>
          <ShoppingOutlined /> 
          Mis Compras ({purchases.length})
        </span>
      ),
      children: (
        <Table
          columns={purchasesColumns}
          dataSource={purchases}
          rowKey="tid"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} compras`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: 'No has realizado ninguna compra todavía'
          }}
        />
      )
    },
    {
      key: 'sales',
      label: (
        <span>
          <DollarOutlined />
          Mis Ventas ({sales.length})
        </span>
      ),
      children: (
        <Table
          columns={salesColumns}
          dataSource={sales}
          rowKey="tid"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} ventas`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: 'No has vendido ningún producto todavía'
          }}
        />
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Mis Transacciones</Title>
      
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default ListTransactionsComponent;