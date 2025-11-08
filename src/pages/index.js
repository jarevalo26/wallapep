import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import ListCategoriesOnlyComponent from '../pages/components/products/ListCategoriesOnlyComponent';
import ListProductsComponent from '../pages/components/products/ListProductsComponent';

const { Title, Paragraph } = Typography;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
    loadProductCounts();
  }, []);

  const checkLoginStatus = () => {
    const apiKey = localStorage.getItem('apiKey');
    setIsLoggedIn(!!apiKey);
  };

  const loadProductCounts = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products/categories/count",
        {
          method: "GET"
        }
      );

      if (response.ok) {
        const data = await response.json();
        let counts = {};        
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.category && item.num_products !== undefined) {
              counts[item.category] = `${item.num_products}+`;
            }
          });
        } else {
          counts = data;
        }
        setProductCounts(counts);
      } else {
        setProductCounts({
          celulares: '20+',
          computadores: '15+',
          televisores: '10+',
          consolas: '8+',
          deportes: '12+',
          accesorios: '25+',
          audio: '10+'
        });
      }
    } catch (error) {
      setProductCounts({
        celulares: '20+',
        computadores: '15+',
        televisores: '10+',
        consolas: '8+',
        deportes: '12+',
        accesorios: '25+',
        audio: '10+'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sección de bienvenida (siempre visible) */}
      <div style={{ textAlign: 'center', marginBottom: 40, padding: '20px 0' }}>
        <Title level={1} style={{ marginBottom: 16 }}>
          Bienvenido a Wallapep
        </Title>
        <Paragraph style={{ fontSize: 16, maxWidth: 600, margin: '0 auto', color: '#666' }}>
          Compra y vende productos de segunda mano. 
          Encuentra ofertas increíbles o vende lo que ya no uses.
        </Paragraph>
      </div>

      {/* Contenido condicional según login */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Title level={4}>Cargando...</Title>
        </div>
      ) : !isLoggedIn ? (
        <ListCategoriesOnlyComponent productCounts={productCounts} />
      ) : (
        <ListProductsComponent 
          showCategoryCards={false}
          showTitle={false}
          displayMode="featured"
        />
      )}
    </div>
  );
}