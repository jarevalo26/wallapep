import { useState } from "react";
import { modifyStateProperty } from "../../../utils/UtilsState";
import { Card, Input, Button, Row, Col, Form, Upload, Select, Typography } from "antd";
import { DollarOutlined, FileTextOutlined, TagOutlined, PictureOutlined } from '@ant-design/icons';
import { CATEGORIES } from "@/pages/api/categories";

const { Title, Text } = Typography;

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

let CreateProductComponent = ({ openNotification }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const initialFormData = {
        title: "",
        description: "",
        price: "",
        image: null,
        category: null
    };

    let [formData, setFormData] = useState(initialFormData);

    let clickCreateProduct = async () => {
        try {
            await form.setFieldsValue({
                title: formData.title,
                description: formData.description,
                price: formData.price,
                category: formData.category
            });
            await form.validateFields();
        } catch (validationError) {
            if (typeof openNotification === "function") {
                openNotification("top", "Por favor completa los campos obligatorios", "warning");
            }
            return;
        }

        setLoading(true);

        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": localStorage.getItem("apiKey")
            },
            body: JSON.stringify(formData)
        })

        if (response.ok) {
            let data = await response.json()
            let imgUploaded = await uploadImage(data.productId)
            if (imgUploaded) {
                if (typeof openNotification === "function") {
                    openNotification("top", "Producto creado exitosamente", "success")
                }
                form.resetFields();
                setFormData(initialFormData);
            }
            else {
                if (typeof openNotification === "function") {
                    openNotification("top", "Producto creado pero falló la subida de imagen", "warning")
                }
                form.resetFields();
                setFormData(initialFormData);
            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg)
            })
            if (typeof openNotification === "function") {
                openNotification("top", "Error al crear producto", "error")
            }
        }
        setLoading(false);
    }

    let uploadImage = async (productId) => {
        if (!formData.image) return true;
        let formDataImage = new FormData();
        formDataImage.append('image', formData.image);

        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products/" + productId + "/image", {
            method: "POST",
            headers: {
                "apikey": localStorage.getItem("apiKey")
            },
            body: formDataImage
        })
        if (response.ok) {
            let data = await response.json()
            return true
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg)
            })
            return false
        }
    }

    return (
        <Row align="middle" justify="center" style={{ minHeight: "70vh", padding: "24px 0" }}>
            <Col xs={24} sm={22} md={20} lg={16} xl={12}>
                <Card style={{ borderRadius: 8 }}>
                    {/* Título - Pauta 1.6 */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Title level={2} style={{ marginBottom: 8, fontSize: 28 }}>
                            Vender producto
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Completa la información de tu producto
                        </Text>
                    </div>

                    <Form form={form} layout="vertical">
                        {/* Título del producto - Pauta 4.3 */}
                        <Form.Item 
                            name="title"
                            label={<Text strong>Título del producto</Text>}
                            rules={[{ required: true, message: "El título es obligatorio" }]}
                        >
                            <Input
                                value={formData.title}
                                onChange={(i) => modifyStateProperty(
                                    formData, setFormData, "title", i.currentTarget.value)}
                                size="large" 
                                prefix={<TagOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Ej: iPhone 17 Pro Max"
                            />
                        </Form.Item>
                        
                        {/* Descripción - Pauta 4.3 */}
                        <Form.Item 
                            name="description"
                            label={<Text strong>Descripción</Text>}
                            rules={[{ required: true, message: "La descripción es obligatoria" }]}
                        >
                            <Input.TextArea
                                value={formData.description} 
                                onChange={
                                    (i) => modifyStateProperty(
                                        formData, setFormData, "description", i.currentTarget.value)}
                                size="large"
                                rows={4}
                                placeholder="Describe el estado, características y detalles importantes" 
                            />
                        </Form.Item>

                        {/* Precio - Pauta 4.11 */}
                        <Form.Item 
                            name="price"
                            label={<Text strong>Precio (€)</Text>}
                            rules={[{ required: true, message: "El precio es obligatorio" }]}
                        >
                            <Input 
                                value={formData.price}
                                onChange={
                                    (i) => modifyStateProperty(
                                        formData, setFormData, "price", i.currentTarget.value)}
                                size="large" 
                                type="number" 
                                prefix={<DollarOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="0.00"
                                min={0}
                            />
                        </Form.Item>

                        {/* Categoría - Pauta 4.3 */}                        
                        <Form.Item 
                            name="category"
                            label={<Text strong>Categoría</Text>}
                            rules={[{ required: true, message: "Selecciona una categoría" }]}
                        >
                            <Select
                                size="large"
                                placeholder="Selecciona una categoría"
                                value={formData.category}
                                onChange={(val) => modifyStateProperty(formData, setFormData, "category", val)}
                            >
                                {CATEGORIES.map((c) => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        
                        {/* Imagen - Pauta 4.5 */}
                        <Form.Item 
                            name="image"
                            label={<Text strong>Imagen del producto</Text>}
                        >
                            <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={(file) => {
                                    file.preview = URL.createObjectURL(file);
                                    modifyStateProperty(formData, setFormData, "image", file);
                                    return false;
                                }}
                                onRemove={() => {
                                    if (formData.image && formData.image.preview) {
                                        URL.revokeObjectURL(formData.image.preview);
                                    }
                                    modifyStateProperty(formData, setFormData, "image", null);
                                }}
                                fileList={formData.image ? [{
                                    uid: formData.image.uid || formData.image.name,
                                    name: formData.image.name,
                                    status: "done",
                                    url: formData.image.preview,
                                    originFileObj: formData.image
                                }] : []}
                            >
                                {formData.image ? null : (
                                    <div>
                                        <PictureOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                                        <div>Subir imagen</div>
                                    </div>
                                )}
                            </Upload>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Formatos: JPG, PNG. Máximo 5MB
                            </Text>
                        </Form.Item>
                    </Form>
                    {/* Botón - Pauta 1.9, 5.2 */}
                    <Button 
                        type="primary" 
                        size="large"
                        onClick={clickCreateProduct} 
                        loading={loading}
                        block
                        style={{ marginTop: 16 }}
                    >
                        Publicar producto
                    </Button>
                </Card>
            </Col>
        </Row>
    )
}

export default CreateProductComponent;
