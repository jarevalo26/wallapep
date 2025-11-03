import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, Col, Row, Input, Select, Button, Tag, Typography, Badge, Statistic } from 'antd';
import { SearchOutlined, CloseOutlined, StarOutlined, FireOutlined, ShoppingOutlined } from '@ant-design/icons';
import { CATEGORIES } from "./api/categories";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function Home() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAUTA 4.2: Limitar información solicitada - Solo filtros esenciales
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
        if (existsImage) p.image = urlImage;
        else p.image = "/imageMockup.png";
        return p;
      });

      let productsWithImage = await Promise.all(promisesForImages);
      setProducts(productsWithImage);
    }
    setLoading(false);
  };

// PAUTA 3.12: Filtrado combinable en frontend
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesMinPrice =
        !minPrice || product.price >= parseFloat(minPrice);
      const matchesMaxPrice =
        !maxPrice || product.price <= parseFloat(maxPrice);

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  // PAUTA 4.18: Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = searchTerm || selectedCategory || minPrice || maxPrice;

  // Producto destacado (el más caro o el primero)
  const featuredProduct = products.length > 0 
    ? products.reduce((max, product) => product.price > max.price ? product : max, products[0])
    : null;

  // Contar productos por categoría
  const getCategoryCount = (categoryId) => {
    return products.filter(p => p.category === categoryId).length;
  };

  return (
    <div>
      {/* PAUTA 1.3: Textos cortos - Explicación breve de la aplicación */}
      {/* PAUTA 1.6: Jerarquía de textos clara */}
      <div style={{ textAlign: 'center', marginBottom: 48, marginTop: 24 }}>
        <Title level={1} style={{ marginBottom: 16 }}>
          Bienvenido a Wallapep
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#666', maxWidth: 800, margin: '0 auto' }}>
          Compra y vende productos de segunda mano de forma rápida y segura. 
          Encuentra ofertas increíbles y conecta con vendedores locales.
        </Paragraph>
      </div>

      {/* PAUTA 1.9 y 1.14: Producto destacado único */}
      {featuredProduct && !hasActiveFilters && (
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            marginBottom: 32,
            borderRadius: 16,
            border: 'none',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: 32 }}
        >
          <Row gutter={32} align="middle">
            <Col xs={24} md={12}>
              <Badge.Ribbon text="Destacado" color="red" style={{ fontSize: 14 }}>
                <img 
                  src={featuredProduct.image} 
                  alt={featuredProduct.title}
                  style={{ 
                    width: '100%', 
                    height: 300, 
                    objectFit: 'cover',
                    borderRadius: 12 
                  }}
                />
              </Badge.Ribbon>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ color: 'white' }}>
                <div style={{ marginBottom: 16 }}>
                  <FireOutlined style={{ fontSize: 24, marginRight: 8 }} />
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                    PRODUCTO DESTACADO
                  </Text>
                </div>
                <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
                  {featuredProduct.title}
                </Title>
                <Paragraph style={{ color: '#e0e0e0', fontSize: 16, marginBottom: 24 }}>
                  {featuredProduct.description}
                </Paragraph>
                
                {/* PAUTA 1.6: Diferenciar etiqueta y valor */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#e0e0e0', display: 'block', marginBottom: 8 }}>
                    Precio
                  </Text>
                  <Title level={1} style={{ color: 'white', margin: 0 }}>
                    €{featuredProduct.price}
                  </Title>
                </div>

                {/* PAUTA 1.10: Botón principal destacado */}
                <Link href={`/detailProduct/${featuredProduct.id}`}>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<ShoppingOutlined />}
                    style={{ 
                      backgroundColor: 'white', 
                      color: '#667eea',
                      borderColor: 'white',
                      fontWeight: 600,
                      height: 48
                    }}
                  >
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* PAUTA 3.3: Uso de imágenes para reconocimiento - Categorías */}
      {/* PAUTA 3.21: Badges con número de elementos */}
      <div style={{ marginBottom: 48 }}>
        <Title level={3} style={{ marginBottom: 24 }}>
          Explora por Categoría
        </Title>
        <Row gutter={[16, 16]}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            const count = getCategoryCount(category.id);
            
            return (
              <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
                {/* PAUTA 3.1: Área clicable identificable */}
                {/* PAUTA 3.13: Resaltar elemento con foco */}
                <Card
                  hoverable
                  onClick={() => setSelectedCategory(isSelected ? "" : category.id)}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 12,
                    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    backgroundColor: isSelected ? '#e6f7ff' : 'white',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                  bodyStyle={{ padding: '24px 16px' }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>
                    {/* Iconos por categoría */}
                    {category.id === 'celulares' && '📱'}
                    {category.id === 'computadores' && '💻'}
                    {category.id === 'televisores' && '📺'}
                    {category.id === 'consolas' && '🎮'}
                    {category.id === 'deportes' && '⚽'}
                    {category.id === 'accesorios' && '🎧'}
                    {category.id === 'audio' && '🔊'}
                  </div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    {category.name}
                  </Text>
                  {/* PAUTA 3.21: Badge con cantidad */}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {count} productos
                  </Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* PAUTA 2.4: Barra de búsqueda convencional */}
      {/* PAUTA 3.12: Mecanismos de filtrado/búsqueda */}
      <Card 
        style={{ marginBottom: 24, borderRadius: 12 }}
        bodyStyle={{ padding: 24 }}
      >
        <Title level={4} style={{ marginBottom: 24 }}>
          Encuentra tu producto
        </Title>

        <Row gutter={[16, 16]}>
          {/* PAUTA 4.12: Resaltar componente con foco */}
          <Col xs={24} md={12}>
            <Input
              size="large"
              placeholder="Buscar productos..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // PAUTA 4.18: Botón X para limpiar
              suffix={
                searchTerm && (
                  <CloseOutlined 
                    onClick={() => setSearchTerm("")}
                    style={{ cursor: 'pointer', color: '#999' }}
                  />
                )
              }
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Select
              size="large"
              placeholder="Categoría"
              value={selectedCategory || undefined}
              onChange={(value) => setSelectedCategory(value)}
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

          {/* PAUTA 4.11: Especificar formato/unidad */}
          <Col xs={12} sm={8} md={4}>
            <Input
              size="large"
              type="number"
              placeholder="Precio mín (€)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={0}
            />
          </Col>

          <Col xs={12} sm={8} md={4}>
            <Input
              size="large"
              type="number"
              placeholder="Precio máx (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
            />
          </Col>
        </Row>

        {/* PAUTA 4.18: Chips de filtros activos eliminables */}
        {hasActiveFilters && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Text type="secondary" style={{ marginRight: 8 }}>Filtros activos:</Text>
            
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
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
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
            >
              Limpiar todos
            </Button>
          </div>
        )}
      </Card>

      {/* PAUTA 3.16: Mostrar número de elementos */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>
          {filteredProducts.length}
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
        </Text>
      </div>

      {/* PAUTA 3.17: Diseño para 0 elementos */}
      { 
        filteredProducts.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 12 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <Title level={3}>No se encontraron productos</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              Intenta ajustar tus filtros o buscar con otros términos
            </Paragraph>
            <Button type="primary" size="large" onClick={clearAllFilters}>
              Limpiar filtros
            </Button>
          </Card>
        ) : (
        /* PAUTA 3.8: Listados organizados en grid */
        /* PAUTA 1.1: Espaciado adecuado */
        <Row gutter={[16, 16]}>
        {
          filteredProducts.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            {/* PAUTA 3.1 y 3.13: Área clicable con feedback */}
            <Link href={`/detailProduct/${product.id}`}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 200, 
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <img
                      alt={product.title}
                      src={product.image}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                }
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: 16 }}
              >
                {/* PAUTA 3.10: Limitar información clave (1-5 propiedades) */}
                {/* PAUTA 1.6: Jerarquía de textos */}
                <Title 
                  level={5} 
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 8, minHeight: 48 }}
                >
                  {product.title}
                </Title>
                
                <Paragraph 
                  type="secondary" 
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 12, minHeight: 44 }}
                >
                  {product.description}
                </Paragraph>

                {/* PAUTA 1.6: Precio destacado */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                    €{product.price}
                  </Text>
                  
                  {/* Indicador de oferta */}
                  {product.price < 50 && (
                    <Tag color="red">¡Oferta!</Tag>
                  )}
                </div>
              </Card>
            </Link>
          </Col>
          ))
        }
        </Row>
      )}
    </div>
  );
}
