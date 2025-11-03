import { useState, useEffect } from 'react';
import { Card, Tabs, Empty, Spin, message, Typography, Row, Col } from 'antd';
import { ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import TransactionCard from './TransactionCard';

const { Title } = Typography;

let ListTransactionsComponent = () => {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    const userId = await getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
      await loadTransactions(userId);
    } else {
      message.warning('No se pudo obtener tu información de usuario');
      setLoading(false);
    }
  };

  // Obtener el ID del usuario actual
  const getCurrentUserId = async () => {
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

  // Cargar transacciones del usuario
  const loadTransactions = async (userId) => {
    setLoading(true);

    try {
      // Cargar compras (donde soy el comprador)
      const purchasesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?buyerId=${userId}`,
        {
          headers: {
            apikey: localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
      } else {
        console.error('Error cargando compras');
      }

      // Cargar ventas (donde soy el vendedor)
      const salesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?sellerId=${userId}`,
        {
          headers: {
            apikey: localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSales(salesData);
      } else {
        console.error('Error cargando ventas');
      }

    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : purchases.length > 0 ? (
            <Row gutter={[16, 16]}>
              {purchases.map((transaction) => (
                <Col xs={24} key={transaction.id}>
                  <TransactionCard
                    transaction={transaction}
                    type="purchase"
                    currentUserId={currentUserId}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No has realizado ninguna compra todavía"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
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
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : sales.length > 0 ? (
            <Row gutter={[16, 16]}>
              {sales.map((transaction) => (
                <Col xs={24} key={transaction.id}>
                  <TransactionCard
                    transaction={transaction}
                    type="sale"
                    currentUserId={currentUserId}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No has vendido ningún producto todavía"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
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

/* import { useState, useEffect } from 'react';
import { Card, Tabs, Empty, Spin, message, Typography, Row, Col } from 'antd';
import { ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import TransactionCard from './TransactionCard';

const { Title } = Typography;

let ListTransactionsComponent = () => {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    const userId = await getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
      await loadTransactions(userId);
    } else {
      message.warning('No se pudo obtener tu información de usuario');
      setLoading(false);
    }
  };

  // Obtener el ID del usuario actual
  const getCurrentUserId = async () => {
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

  // Cargar transacciones del usuario
  const loadTransactions = async (userId) => {
    setLoading(true);
    try {
      // Cargar compras (donde soy el comprador)
      const purchasesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?buyerId=${userId}`,
        {
          headers: {
            apikey: localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
      } else {
        console.error('Error cargando compras');
      }

      // Cargar ventas (donde soy el vendedor)
      const salesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/transactions/public?sellerId=${userId}`,
        {
          headers: {
            apikey: localStorage.getItem('apiKey') || ''
          }
        }
      );

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSales(salesData);
      } else {
        console.error('Error cargando ventas');
      }

    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : purchases.length > 0 ? (
            <Row gutter={[16, 16]}>
              {purchases.map((transaction) => (
                <Col xs={24} key={transaction.id}>
                  <TransactionCard
                    transaction={transaction}
                    type="purchase"
                    currentUserId={currentUserId}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No has realizado ninguna compra todavía"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
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
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : sales.length > 0 ? (
            <Row gutter={[16, 16]}>
              {sales.map((transaction) => (
                <Col xs={24} key={transaction.id}>
                  <TransactionCard
                    transaction={transaction}
                    type="sale"
                    currentUserId={currentUserId}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No has vendido ningún producto todavía"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
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

export default ListTransactionsComponent; */