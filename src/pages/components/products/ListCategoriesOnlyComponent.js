import { Card, Row, Col, Typography, Button } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { CATEGORIES } from '../../api/categories';

const { Title, Text, Paragraph } = Typography;

const ListCategoriesOnlyComponent = ({ productCounts }) => {
  console.log('🏷️ CategoriesOnly recibió productCounts:', productCounts);
  return (
    <div>
      <Card 
        style={{ 
          marginBottom: 40, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }}
      >
        <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
          Descubre miles de productos
        </Title>
        <Paragraph style={{ fontSize: 16, color: 'white', marginBottom: 24 }}>
          Inicia sesión para explorar productos por categoría, comparar precios y realizar compras.
        </Paragraph>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login">
            <Button 
              type="primary" 
              size="large" 
              icon={<LoginOutlined />}
              style={{ 
                background: 'white', 
                color: '#667eea',
                border: 'none',
                fontWeight: 'bold'
              }}
            >
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button 
              size="large" 
              icon={<UserAddOutlined />}
              style={{ 
                background: 'transparent',
                color: 'white',
                borderColor: 'white',
                fontWeight: 'bold'
              }}
            >
              Registrarse gratis
            </Button>
          </Link>
        </div>
      </Card>

      <div style={{ marginBottom: 30 }}>
        <Title level={3} style={{ marginBottom: 24, textAlign: 'center' }}>
          Explora nuestras categorías
        </Title>
        <Row gutter={[16, 16]} justify="center">
          {CATEGORIES.map((category) => {
            const productCount = productCounts[category.id] || 0;

            return (
              <Col xs={12} sm={8} md={6} lg={6} xl={3} key={category.id}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                  styles={{ body: { padding: '24px 16px' } }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>
                    {category.id === 'celulares' && '📱'}
                    {category.id === 'computadores' && '💻'}
                    {category.id === 'televisores' && '📺'}
                    {category.id === 'consolas' && '🎮'}
                    {category.id === 'deportes' && '⚽'}
                    {category.id === 'accesorios' && '🎧'}
                    {category.id === 'audio' && '🔊'}
                  </div>
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                    {category.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {productCount} {productCount === 1 ? 'producto' : 'productos'}
                  </Text>
                </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      </div>

      <Card 
        style={{ 
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8f9fa',
          border: '2px dashed #d9d9d9'
        }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          ¿Listo para empezar?
        </Title>
        <Paragraph style={{ color: '#666', marginBottom: 24 }}>
          Únete a nuestra comunidad y empieza a comprar y vender productos hoy mismo.
        </Paragraph>
        <Link href="/register">
          <Button type="primary" size="large" icon={<UserAddOutlined />}>
            Crear cuenta gratis
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default ListCategoriesOnlyComponent;