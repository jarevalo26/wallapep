import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Col, Row, Typography, Divider, Button } from "antd";
import { CATEGORIES } from "./api/categories";

const { Title, Paragraph } = Typography;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = todas las categorías

  useEffect(() => {
    getProducts();
  }, []);

  // Verificar si imagen existe
  const checkURL = async (url) => {
    try {
      let response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Obtener productos del backend
  const getProducts = async () => {
    setLoading(true);
    let response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products",
      {
        method: "GET",
        headers: {
          apikey: localStorage.getItem("apiKey") || "",
        },
      }
    );

    if (response.ok) {
      let jsonData = await response.json();

      // Cargar imágenes
      let promisesForImages = jsonData.map(async (p) => {
        let urlImage = process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/images/" + p.id + ".png";
        let existsImage = await checkURL(urlImage);
        if (existsImage) {
          p.image = urlImage;
        } else {
          p.image = "/imageMockup.png";
        }
        return p;
      });

      let productsWithImage = await Promise.all(promisesForImages);
      setProducts(productsWithImage);
    } else {
      let responseBody = await response.json();
      let serverErrors = responseBody.errors;
      serverErrors.forEach((e) => {
        console.log("Error: " + e.msg);
      });
    }
    setLoading(false);
  };

  // Agrupar productos por categoría
  const groupProductsByCategory = () => {
    const grouped = {};
    
    // Inicializar todas las categorías
    CATEGORIES.forEach(cat => {
      grouped[cat.id] = [];
    });

    // Agrupar productos
    products.forEach(product => {
      if (product.category && grouped[product.category]) {
        grouped[product.category].push(product);
      }
    });

    return grouped;
  };

  const productsByCategory = groupProductsByCategory();

  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Manejar clic en categoría
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Volver a mostrar todas las categorías
  const handleShowAllCategories = () => {
    setSelectedCategory(null);
  };

  // Determinar qué categorías mostrar
  const categoriesToShow = selectedCategory 
    ? CATEGORIES.filter(cat => cat.id === selectedCategory)
    : CATEGORIES;

    return (
        <div>
            {/* Explicación breve de la aplicación */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={1}>Bienvenido a Wallapep</Title>
                <Paragraph style={{ fontSize: 16 }}>
                Compra y vende productos de segunda mano. 
                Encuentra ofertas increíbles o vende lo que ya no uses.
                </Paragraph>
            </div>

            {/* Mostrar las categorías */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>Categorías</Title>
                
                {/* Botón para volver a ver todas las categorías */}
                {selectedCategory && (
                <Button type="primary" onClick={handleShowAllCategories}>
                    Ver todas las categorías
                </Button>
                )}
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
                { CATEGORIES.map((category) => {
                    const categoryProducts = productsByCategory[category.id] || [];
                    const productCount = categoryProducts.length;
                    const isSelected = selectedCategory === category.id;

                    return (
                        <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
                            <Card 
                                hoverable
                                onClick={() => handleCategoryClick(category.id)}
                                style={{ 
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                    backgroundColor: isSelected ? '#e6f7ff' : 'white'
                                }}
                            >
                                <div style={{ fontSize: 40, marginBottom: 10 }}>
                                    {category.id === 'celulares' && '📱'}
                                    {category.id === 'computadores' && '💻'}
                                    {category.id === 'televisores' && '📺'}
                                    {category.id === 'consolas' && '🎮'}
                                    {category.id === 'deportes' && '⚽'}
                                    {category.id === 'accesorios' && '🎧'}
                                    {category.id === 'audio' && '🔊'}
                                </div>
                                <Title level={5}>{category.name}</Title>
                                <Paragraph type="secondary">
                                    {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                </Paragraph>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <Divider />

            {/* Mensaje indicando qué categoría está activa */}
            {selectedCategory && (
                <div style={{ marginBottom: 20 }}>
                <Title level={4}>
                    Mostrando productos de: {getCategoryName(selectedCategory)}
                </Title>
                </div>
            )}

            {/* Productos agrupados por categoría */}
            {categoriesToShow.map((category) => {
                const categoryProducts = productsByCategory[category.id] || [];
        
                // Solo mostrar categoría si tiene productos
                if (categoryProducts.length === 0) {
                    return (
                        <div key={category.id} style={{ marginBottom: 40, textAlign: 'center', padding: 40 }}>
                        <Title level={4}>No hay productos en {category.name}</Title>
                        <Paragraph type="secondary">Sé el primero en vender un producto en esta categoría</Paragraph>
                        </div>
                    );
                }

                // Si hay una categoría seleccionada, mostrar TODOS los productos
                // Si no hay categoría seleccionada, mostrar solo 4 productos
                const productsToShow = selectedCategory 
                ? categoryProducts  // Mostrar todos
                : categoryProducts.slice(0, 4); // Mostrar solo 4

                return (
                    <div key={category.id} style={{ marginBottom: 40 }}>
                        {/* Título de la categoría con contador */}
                        <Title level={3}>
                            {category.name} ({categoryProducts.length})
                        </Title>
                        {/* Grid de productos */}
                        <Row gutter={[16, 16]}>
                            {productsToShow.map((product) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                            <Link href={`/detailProduct/${product.id}`}>
                                <Card
                                hoverable
                                cover={
                                    <img
                                    alt={product.title}
                                    src={product.image}
                                    style={{ height: 200, objectFit: 'cover' }}
                                    />
                                }
                                >
                                <Card.Meta
                                    title={product.title}
                                    description={
                                    <div>
                                        <Paragraph ellipsis={{ rows: 2 }}>
                                        {product.description}
                                        </Paragraph>
                                        <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                                        €{product.price}
                                        </Title>
                                    </div>
                                    }
                                />
                                </Card>
                            </Link>
                            </Col>
                        ))}
                        </Row>

                        {/* Mostrar botón "Ver más" solo cuando NO hay categoría seleccionada */}
                        {!selectedCategory && categoryProducts.length > 4 && (
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Button 
                                type="link" 
                                onClick={() => handleCategoryClick(category.id)}
                                style={{ fontSize: 16 }}
                                >
                                Ver todos los {categoryProducts.length} productos de {category.name} →
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Mensaje si no hay productos en ninguna categoría */}
            {products.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                <Title level={3}>No hay productos disponibles</Title>
                <Paragraph>Sé el primero en vender un producto</Paragraph>
                </div>
            )}
        </div>
    );



}
