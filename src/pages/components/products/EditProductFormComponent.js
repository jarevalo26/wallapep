import { useState, useEffect } from "react";
import { Card, Input, Button, Row, Col, Form, Select, Typography, Spin, message } from "antd";
import { TagOutlined, DollarOutlined, LoadingOutlined } from '@ant-design/icons';
import { modifyStateProperty } from "../../../utils/UtilsState";
import { CATEGORIES } from "@/pages/api/categories";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

// Iconos centralizados
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

let EditProductFormComponent = ({id}) => {
    const router = useRouter();
    const [form] = Form.useForm();
    let [formData, setFormData] = useState({})
    let [loading, setLoading] = useState(true);
    let [saving, setSaving] = useState(false);

    useEffect(() => {
        getProduct(id);
    }, [])

    let getProduct = async (id) => {
        setLoading(true);
        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products/" + id,
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            });

        if (response.ok) {
            let jsonData = await response.json();
            setFormData(jsonData)
            form.setFieldsValue({
                title: jsonData.title,
                description: jsonData.description,
                price: jsonData.price,
                category: jsonData.category
            });
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.error("Error: " + e.msg)
            })
            message.error('Error al cargar el producto');
        }
        setLoading(false);
    }

    let clickEditProduct = async () => {
        try {
            await form.validateFields();
        } catch (validationError) {
            message.warning('Por favor completa los campos obligatorios');
            return;
        }
        setSaving(true);

        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products/" + id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": localStorage.getItem("apiKey")
                },
                body: JSON.stringify(formData)
            });

        if ( response.ok ){
            let jsonData = await response.json();
            message.success('Producto actualizado correctamente');
            setTimeout(() => {
                router.push('/myProducts');
            }, 1000);
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.error("Error: " + e.msg)
            })
            message.error('Error al actualizar el producto');
        }
        setSaving(false);
    }

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
        <Row align="middle" justify="center" style={{ minHeight: "70vh", padding: "24px 0" }}>
            <Col xs={24} sm={22} md={20} lg={16} xl={12}>
                <Card style={{ borderRadius: 8 }}>
                    {/* Título - Pauta 1.6 */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Title level={2} style={{ marginBottom: 8, fontSize: 28 }}>
                            Editar producto
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Modifica la información de tu producto
                        </Text>
                    </div>

                    <Form form={form} layout="vertical">
                        {/* Título - Pauta 4.3 */}
                        <Form.Item
                            label={<Text strong>Título del producto</Text>}
                            name="title"
                            rules={[{ required: true, message: 'El título es obligatorio' }]}
                        >
                            <Input 
                                onChange={(i) => modifyStateProperty(formData, setFormData, "title", i.currentTarget.value)}
                                size="large"
                                prefix={<TagOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Título del producto"
                                value={formData?.title}
                            />
                        </Form.Item>

                        {/* Descripción - Pauta 4.3 */}
                        <Form.Item
                            label={<Text strong>Descripción</Text>}
                            name="description"
                            rules={[{ required: true, message: 'La descripción es obligatoria' }]}
                        >
                            <Input.TextArea 
                                onChange={(i) => modifyStateProperty(formData, setFormData, "description", i.currentTarget.value)}
                                size="large"
                                rows={4}
                                placeholder="Descripción del producto"
                                value={formData?.description}
                            />
                        </Form.Item>

                        {/* Precio - Pauta 4.11 */}
                        <Form.Item
                            label={<Text strong>Precio (€)</Text>}
                            name="price"
                            rules={[{ required: true, message: 'El precio es obligatorio' }]}
                        >
                            <Input 
                                onChange={(i) => modifyStateProperty(formData, setFormData, "price", i.currentTarget.value)}
                                size="large"
                                type="number"
                                prefix={<DollarOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Precio"
                                value={formData?.price}
                                min={0}
                            />
                        </Form.Item>

                        {/* Categoría - Pauta 4.3 */}
                        <Form.Item
                            label={<Text strong>Categoría</Text>}
                            name="category"
                            rules={[{ required: true, message: 'Selecciona una categoría' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Selecciona una categoría"
                                value={formData.category}
                                onChange={(val) => modifyStateProperty(formData, setFormData, "category", val)}
                            >
                                {CATEGORIES.map((c) => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {getCategoryIcon(c.id)} {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>

                    {/* Botones - Pauta 2.5 */}
                    <div style={{ 
                        display: 'flex', 
                        gap: 16, 
                        marginTop: 24 
                    }}>
                        <Button 
                            size="large"
                            block
                            onClick={() => router.back()}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="primary"
                            size="large"
                            block
                            onClick={clickEditProduct}
                            loading={saving}
                        >
                            Guardar cambios
                        </Button>
                    </div>
                </Card>
            </Col>
        </Row>
    )
}

export default EditProductFormComponent;
