import { useState, useEffect } from "react";
import { Typography, Card, Descriptions, Image, Row, Col, Tag, Divider } from 'antd';
import BuyButton from './BuyButton'; // Ajusta la ruta según dónde lo guardes

const { Title, Text } = Typography;

let DetailsProductComponent = ({ id }) => {
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        getProduct(id);
        getCurrentUserId();
    }, []);

    // Obtener el ID del usuario actual
    const getCurrentUserId = () => {
        try {
            // Obtener del localStorage (guardado en el login)
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

    // Obtener producto del backend
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
                
                // Verificar si la imagen existe
                const imageUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/images/" + jsonData.id + ".png";
                const imageExists = await checkImageExists(imageUrl);
                
                jsonData.image = imageExists ? imageUrl : "/imageMockup.png";
                setProduct(jsonData);
            } else {
                let responseBody = await response.json();
                let serverErrors = responseBody.errors;
                serverErrors?.forEach(e => {
                    console.log("Error: " + e.msg);
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    // Verificar si la imagen existe
    const checkImageExists = async (url) => {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    // Callback después de compra exitosa
    const handlePurchaseSuccess = (transaction) => {
        // Refrescar el producto para mostrar que está vendido
        getProduct(id);
    };

    // Obtener el nombre de la categoría
    const getCategoryName = (categoryId) => {
        const categories = {
            'celulares': 'Celulares',
            'computadores': 'Computadores',
            'televisores': 'Televisores',
            'videojuegos': 'Videojuegos',
            'deportes': 'Deportes',
            'accesorios': 'Accesorios',
            'audio': 'Audio'
        };
        return categories[categoryId] || categoryId;
    };

    if (loading) {
        return (
            <Card loading={true}>
                <Descriptions title="Cargando producto..." />
            </Card>
        );
    }

    return (
        <Card>
            <Row gutter={[24, 24]}>
                {/* Columna de la imagen */}
                <Col xs={24} md={12}>
                    <Image 
                        src={product.image || "/imageMockup.png"} 
                        alt={product.title}
                        style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }}
                    />
                </Col>

                {/* Columna de la información */}
                <Col xs={24} md={12}>
                    <div>
                        {/* Título */}
                        <Title level={2} style={{ marginBottom: 8 }}>
                            {product.title}
                        </Title>

                        {/* Precio */}
                        <Title level={3} style={{ color: '#1890ff', marginBottom: 16 }}>
                            €{product.price}
                        </Title>

                        {/* Estado del producto */}
                        {product.sold && (
                            <Tag color="red" style={{ marginBottom: 16, fontSize: 14, padding: '4px 12px' }}>
                                VENDIDO
                            </Tag>
                        )}

                        {!product.sold && product.price < 100 && (
                            <Tag color="green" style={{ marginBottom: 16, fontSize: 14, padding: '4px 12px' }}>
                                ¡OFERTA!
                            </Tag>
                        )}

                        <Divider />

                        {/* Descripción */}
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Descripción">
                                <Text>{product.description || 'Sin descripción'}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Categoría">
                                <Tag color="blue">{getCategoryName(product.category)}</Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="ID del producto">
                                <Text type="secondary">#{product.id}</Text>
                            </Descriptions.Item>

                            {product.userId && (
                                <Descriptions.Item label="Vendedor">
                                    <Text>Usuario #{product.userId}</Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider />

                        {/* Botón de compra */}
                        <BuyButton
                            product={product}
                            currentUserId={currentUserId}
                            onSuccess={handlePurchaseSuccess}
                        />
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default DetailsProductComponent;