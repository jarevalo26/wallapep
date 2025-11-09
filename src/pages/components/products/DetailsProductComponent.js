import { useState, useEffect } from "react";
import { Typography, Card, Descriptions, Image, Row, Col, Tag, Divider, Spin, Button } from 'antd';
import { LoadingOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import BuyButton from './BuyButton'; 
import Link from 'next/link';

const { Title, Text } = Typography;

// Iconos y nombres centralizados
const getCategoryIcon = (categoryId) => {
    const icons = {
        'celulares': '📱',
        'computadores': '💻',
        'televisores': '📺',
        'consolas': '🎮',
        'videojuegos': '🎮',
        'deportes': '⚽',
        'accesorios': '🎧',
        'audio': '🔊'
    };
    return icons[categoryId] || '📦';
};

const getCategoryName = (categoryId) => {
    const categories = {
        'celulares': 'Celulares',
        'computadores': 'Computadores',
        'televisores': 'Televisores',
        'videojuegos': 'Videojuegos',
        'consolas': 'Consolas',
        'deportes': 'Deportes',
        'accesorios': 'Accesorios',
        'audio': 'Audio'
    };
    return categories[categoryId] || categoryId;
};

let DetailsProductComponent = ({ id }) => {
    const router = useRouter();
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        getProduct(id);
        getCurrentUserId();
    }, []);

    const getCurrentUserId = () => {
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                setCurrentUserId(parseInt(userId));
            } else {
                setCurrentUserId(null);
            }
        } catch (error) {
            console.error('Error obteniendo userId:', error);
            setCurrentUserId(null);
        }
    };

    const getProduct = async (id) => {
        setLoading(true);
        try {
            let response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products/" + id,
                {
                    method: "GET",
                    headers: {
                        "apikey": localStorage.getItem("apiKey") || ""
                    },
                }
            );

            if (response.ok) {
                let jsonData = await response.json();
                
                const imageUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/images/" + jsonData.id + ".png";
                const imageExists = await checkImageExists(imageUrl);
                
                jsonData.image = imageExists ? imageUrl : "/imageMockup.png";
                setProduct(jsonData);
            } else {
                let responseBody = await response.json();
                let serverErrors = responseBody.errors;
                serverErrors?.forEach(e => {
                    console.error("Error: " + e.msg);
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkImageExists = async (url) => {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const handlePurchaseSuccess = (transaction) => {
        getProduct(id);
    };

    // Loading - Pauta 5.2
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 24px', minHeight: '60vh' }}>
                <Spin 
                    indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                    size="large"
                />
                <Title level={4} style={{ marginTop: 24, color: 'rgba(0, 0, 0, 0.45)' }}>
                    Cargando producto...
                </Title>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Botón volver - Pauta 3.18 */}
            <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                style={{ marginBottom: 16 }}
            >
                Volver
            </Button>
            <Card style={{ borderRadius: 8 }}>
                <Row gutter={[32, 32]}>
                    {/* Columna de la imagen */}
                    <Col xs={24} md={12}>
                        <div style={{
                            background: '#f5f5f5',
                            borderRadius: 8,
                            padding: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 400
                        }}>
                            <Image 
                                src={product.image || "/imageMockup.png"} 
                                alt={product.title}
                                style={{ 
                                    width: '100%',
                                    maxHeight: 500,
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    </Col>

                    {/* Columna de la información */}
                    <Col xs={24} md={12}>
                        <div>
                            {/* Estado del producto - Pauta 2.7 */}
                            {product.buyerId && (
                                <Tag color="red" style={{ 
                                    marginBottom: 16, 
                                    fontSize: 14, 
                                    padding: '6px 16px',
                                    fontWeight: 600
                                }}>
                                    🔒 VENDIDO
                                </Tag>
                            )}

                            {!product.buyerId && product.price < 100 && (
                                <Tag color="green" style={{ 
                                    marginBottom: 16, 
                                    fontSize: 14, 
                                    padding: '6px 16px',
                                    fontWeight: 600
                                }}>
                                    🔥 ¡OFERTA!
                                </Tag>
                            )}

                            {/* Título - Pauta 1.6 */}
                            <Title level={2} style={{ 
                                marginBottom: 16,
                                fontSize: 32,
                                fontWeight: 700
                            }}>
                                {product.title}
                            </Title>

                            {/* Precio destacado - Pauta 1.9 */}
                            <div style={{
                                background: '#f0f7ff',
                                padding: '16px 24px',
                                borderRadius: 8,
                                marginBottom: 24
                            }}>
                                <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                                    Precio
                                </Text>
                                <Title level={1} style={{ 
                                    color: '#1890ff', 
                                    margin: 0,
                                    fontSize: 42,
                                    fontWeight: 700
                                }}>
                                    €{product.price}
                                </Title>
                            </div>

                            <Divider />

                            {/* Información del producto - Pauta 3.10 */}
                            <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 600 }}>
                                <Descriptions.Item label="Descripción">
                                    <Text style={{ fontSize: 15, lineHeight: 1.6 }}>
                                        {product.description || 'Sin descripción'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Categoría">
                                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                                        {getCategoryIcon(product.category)} {getCategoryName(product.category)}
                                    </Tag>
                                </Descriptions.Item>

                                <Descriptions.Item label="ID del producto">
                                    <Text type="secondary">#{product.id}</Text>
                                </Descriptions.Item>

                                {product.sellerId && (
                                <Descriptions.Item label="Vendedor">
                                    <Link href={`/profile/${product.sellerId}`}>
                                        <span style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: 8,
                                            color: '#1890ff',
                                            cursor: 'pointer'
                                        }}>
                                            <UserOutlined />
                                            Usuario #{product.sellerId}
                                        </span>
                                    </Link>
                                </Descriptions.Item>
                            )}
                            </Descriptions>

                            <Divider />

                            {/* Botón de compra - Pauta 1.9 */}
                            <BuyButton
                                product={product}
                                currentUserId={currentUserId}
                                onSuccess={handlePurchaseSuccess}
                            />
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default DetailsProductComponent;