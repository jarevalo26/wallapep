import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, Col, Row, Typography, Divider, Input, Select, Button, Tag } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { CATEGORIES } from "../../api/categories";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ListProductsComponent = ({ 
  showCategoryCards = false,
  showTitle = true,
  initialCategory = "",
  displayMode = "all"
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const checkURL = async (url) => {
    try {
      let response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

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
      serverErrors?.forEach((e) => {
        console.log("Error: " + e.msg);
      });
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Búsqueda por título
      const matchesSearch = searchTerm === "" || 
        product.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchesCategory = selectedCategory === "" || 
        product.category === selectedCategory;
      
      // Filtro por precio mínimo
      const matchesMinPrice = minPrice === "" || 
        product.price >= parseFloat(minPrice);
      
      // Filtro por precio máximo
      const matchesMaxPrice = maxPrice === "" || 
        product.price <= parseFloat(maxPrice);
      
      // Retorna true solo si cumple TODOS los filtros (AND)
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = searchTerm || selectedCategory || minPrice || maxPrice;

  // Contar productos por categoría (para mostrar en las cards)
  const getProductCountByCategory = (categoryId) => {
    return products.filter(p => p.category === categoryId).length;
  };

  // Agrupar productos por categoría (para modo "featured")
  const getProductsByCategory = (categoryId, limit = 4) => {
    return filteredProducts
      .filter(p => p.category === categoryId)
      .slice(0, limit);
  };

  // Verificar si una categoría tiene productos
  const categoryHasProducts = (categoryId) => {
    return filteredProducts.some(p => p.category === categoryId);
  };

  return (
    <div>
      {/* ============================================ */}
      {/* BUSCADOR - Filtros */}
      {/* ============================================ */}
      <Card style={{ marginBottom: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={4} style={{ marginBottom: 20 }}>
          🔍 Encuentra tu producto
        </Title>

        {/* Búsqueda por título */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24}>
            <Input
              size="large"
              placeholder="Buscar por título del producto..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suffix={
                searchTerm && (
                  <CloseOutlined 
                    onClick={() => setSearchTerm("")}
                    style={{ cursor: 'pointer', color: '#999' }}
                  />
                )
              }
              allowClear
            />
          </Col>
        </Row>

        {/* Filtros de categoría y precio */}
        <Row gutter={[16, 16]}>
          {/* Filtro por categoría */}
          <Col xs={24} sm={12} md={8}>
            <Select
              size="large"
              placeholder="Todas las categorías"
              value={selectedCategory || undefined}
              onChange={(value) => setSelectedCategory(value || "")}
              style={{ width: '100%' }}
              allowClear
            >
              {CATEGORIES.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Filtro por precio mínimo */}
          <Col xs={12} sm={6} md={4}>
            <Input
              size="large"
              type="number"
              placeholder="Precio mín (€)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={0}
              prefix="€"
            />
          </Col>

          {/* Filtro por precio máximo */}
          <Col xs={12} sm={6} md={4}>
            <Input
              size="large"
              type="number"
              placeholder="Precio máx (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
              prefix="€"
            />
          </Col>
        </Row>

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 14 }}>Filtros activos:</Text>
            
            {searchTerm && (
              <Tag 
                closable 
                onClose={() => setSearchTerm("")}
                color="blue"
              >
                Búsqueda: "{searchTerm}"
              </Tag>
            )}
            
            {selectedCategory && (
              <Tag 
                closable 
                onClose={() => setSelectedCategory("")}
                color="blue"
              >
                {getCategoryName(selectedCategory)}
              </Tag>
            )}
            
            {minPrice && (
              <Tag 
                closable 
                onClose={() => setMinPrice("")}
                color="blue"
              >
                Desde: €{minPrice}
              </Tag>
            )}
            
            {maxPrice && (
              <Tag 
                closable 
                onClose={() => setMaxPrice("")}
                color="blue"
              >
                Hasta: €{maxPrice}
              </Tag>
            )}

            <Button 
              type="link" 
              size="small"
              onClick={clearAllFilters}
              style={{ padding: 0 }}
            >
              Limpiar todos
            </Button>
          </div>
        )}
      </Card>

      {/* ============================================ */}
      {/* CATEGORÍAS - Navegación visual (opcional) */}
      {/* ============================================ */}
      {showCategoryCards && (
        <div style={{ marginBottom: 30 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Explora por categorías
          </Title>
          <Row gutter={[16, 16]}>
            {CATEGORIES.map((category) => {
              const productCount = getProductCountByCategory(category.id);
              const isSelected = selectedCategory === category.id;

              return (
                <Col xs={12} sm={8} md={6} lg={6} xl={3} key={category.id}>
                  <Card 
                    hoverable
                    onClick={() => handleCategoryClick(category.id)}
                    style={{ 
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      backgroundColor: isSelected ? '#e6f7ff' : 'white',
                      transition: 'all 0.3s'
                    }}
                    styles={{ body: { padding: '16px 8px' } }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {category.id === 'celulares' && '📱'}
                      {category.id === 'computadores' && '💻'}
                      {category.id === 'televisores' && '📺'}
                      {category.id === 'consolas' && '🎮'}
                      {category.id === 'deportes' && '⚽'}
                      {category.id === 'accesorios' && '🎧'}
                      {category.id === 'audio' && '🔊'}
                    </div>
                    <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                      {category.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {productCount} {productCount === 1 ? 'producto' : 'productos'}
                    </Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {showTitle && <Divider />}

      {/* ============================================ */}
      {/* RESULTADOS - Productos filtrados */}
      {/* ============================================ */}
      
      {/* Título de sección (opcional) */}
      {showTitle && <h2>Productos</h2>}

      {/* Contador de productos encontrados */}
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 16 }}>
          {filteredProducts.length}
        </Text>
        <Text style={{ marginLeft: 8, color: '#666' }}>
          {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
        </Text>
      </div>

      {/* Estado vacío (0 resultados) */}
      {filteredProducts.length === 0 && !loading && (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <Title level={3}>No se encontraron productos</Title>
          <Paragraph style={{ color: '#666', marginBottom: 24 }}>
            Intenta ajustar tus filtros o buscar con otros términos
          </Paragraph>
          <Button type="primary" size="large" onClick={clearAllFilters}>
            Limpiar filtros
          </Button>
        </Card>
      )}

      {/* Grid de productos filtrados */}
      {filteredProducts.length > 0 && displayMode === "all" && (
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product) => (
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
                    title={<span style={{ fontSize: 14 }}>{product.title}</span>}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 13, marginBottom: 8 }}>
                          {product.description}
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                            €{product.price}
                          </Text>
                          {product.category && (
                            <Tag color="blue" style={{ fontSize: 11 }}>
                              {getCategoryName(product.category)}
                            </Tag>
                          )}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      {/* Modo FEATURED: Productos agrupados por categoría */}
      {displayMode === "featured" && (
        <div>
          {CATEGORIES.map((category) => {
            const categoryProducts = getProductsByCategory(category.id, 4);
            const totalInCategory = filteredProducts.filter(p => p.category === category.id).length;

            // Solo mostrar categoría si tiene productos
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} style={{ marginBottom: 40 }}>
                {/* Título de categoría con icono y contador */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 20 
                }}>
                  <Title level={3} style={{ margin: 0 }}>
                    <span style={{ fontSize: 32, marginRight: 12 }}>
                      {category.id === 'celulares' && '📱'}
                      {category.id === 'computadores' && '💻'}
                      {category.id === 'televisores' && '📺'}
                      {category.id === 'consolas' && '🎮'}
                      {category.id === 'deportes' && '⚽'}
                      {category.id === 'accesorios' && '🎧'}
                      {category.id === 'audio' && '🔊'}
                    </span>
                    {category.name}
                    <Text type="secondary" style={{ fontSize: 16, marginLeft: 12, fontWeight: 'normal' }}>
                      ({totalInCategory} {totalInCategory === 1 ? 'producto' : 'productos'})
                    </Text>
                  </Title>

                  {/* Botón "Ver todos" */}
                  {totalInCategory > 4 && (
                    <Link href={`/products?category=${category.id}`}>
                      <Button type="link" size="large">
                        Ver todos →
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Grid de productos de esta categoría */}
                <Row gutter={[16, 16]}>
                  {categoryProducts.map((product) => (
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
                            title={<span style={{ fontSize: 14 }}>{product.title}</span>}
                            description={
                              <div>
                                <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 13, marginBottom: 8 }}>
                                  {product.description}
                                </Paragraph>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                  <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                                    €{product.price}
                                  </Text>
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>

                <Divider />
              </div>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Title level={4}>Cargando productos...</Title>
        </div>
      )}
    </div>
  );
};

export default ListProductsComponent;