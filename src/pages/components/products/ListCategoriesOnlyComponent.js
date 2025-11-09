import { Card, Typography, Button } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { CATEGORIES } from '../../api/categories';

const { Title, Text, Paragraph } = Typography;

// Iconos por categoría - centralizado (pauta 2.2)
const getCategoryIcon = (categoryId) => {
  const icons = {
    'celulares': '📱',
    'computadores': '💻',
    'televisores': '📺',
    'consolas': '🎮',
    'deportes': '⚽',
    'accesorios': '🎧',
    'audio': '🔊'
  };
  return icons[categoryId] || '📦';
};

const ListCategoriesOnlyComponent = ({ productCounts }) => {

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      
      {/* Card principal de CTA - Pauta 1.9 (tarea principal destacada) */}
      <Card 
        style={{ 
          marginBottom: 48, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 8
        }}
        styles={{ body: { padding: 48 } }}
      >
        <Title level={2} style={{ color: 'white', marginBottom: 16, fontSize: 32 }}>
          Descubre miles de productos
        </Title>
        <Paragraph style={{ 
          fontSize: 18, 
          color: 'white', 
          marginBottom: 32,
          maxWidth: 600,
          margin: '0 auto 32px'
        }}>
          Inicia sesión para explorar productos por categoría, comparar precios y realizar compras.
        </Paragraph>
        
        {/* Botones - Pauta 1.10 (opción principal diferenciada) */}
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
                fontWeight: 600
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
                fontWeight: 600
              }}
            >
              Registrarse gratis
            </Button>
          </Link>
        </div>
      </Card>

      {/* Sección de categorías - Pauta 1.1 (espacio en blanco) */}
      <div style={{ marginBottom: 48 }}>
        <Title level={3} style={{ 
          marginBottom: 32, 
          textAlign: 'center',
          fontSize: 28
        }}>
          Explora nuestras categorías
        </Title>
        
        {/* Grid de categorías - Pauta 3.21 (número de elementos en categorías) */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            padding: '8px 0 16px 0',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d9d9d9 transparent'
          }}
        >
          {CATEGORIES.map((category) => {
            const productCount = productCounts[category.id] || 0;

            return (
              <div key={category.id} style={{ flex: '0 0 auto', width: 160 }}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Card 
                    hoverable
                    style={{ 
                      textAlign: 'center',
                      cursor: 'pointer',
                      height: 180,
                      borderRadius: 8,
                      transition: 'all 0.3s',
                      minWidth: 160
                    }}
                    styles={{ body: { padding: 24 } }}
                  >
                    {/* Icono - Pauta 3.3 (imágenes para reconocimiento) */}
                    <div style={{ fontSize: 48, marginBottom: 16 }}>
                      {getCategoryIcon(category.id)}
                    </div>
                    
                    {/* Nombre - Pauta 1.6 (textos clave destacados) */}
                    <Text strong style={{ 
                      fontSize: 14, 
                      display: 'block', 
                      marginBottom: 8,
                      color: 'rgba(0, 0, 0, 0.85)',
                      minHeight: 20
                    }}>
                      {category.name}
                    </Text>
                    
                    {/* Contador - Pauta 3.16 (número de elementos) */}
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {productCount} {productCount === 1 ? 'producto' : 'productos'}
                    </Text>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card final CTA */}
      <Card 
        style={{ 
          textAlign: 'center',
          padding: '48px 24px',
          background: '#f8f9fa',
          border: '2px dashed #d9d9d9',
          borderRadius: 8
        }}
      >
        <Title level={4} style={{ marginBottom: 16, fontSize: 22 }}>
          ¿Listo para empezar?
        </Title>
        <Paragraph style={{ 
          color: 'rgba(0, 0, 0, 0.65)', 
          marginBottom: 24,
          fontSize: 16
        }}>
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