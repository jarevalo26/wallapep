import { useState } from "react";
import { modifyStateProperty } from "../../../utils/UtilsState";
import { Card, Input, Button, Row, Col, Form, Upload, Select } from "antd";
import { CATEGORIES } from "@/pages/api/categories";

let CreateProductComponent = ({ openNotification }) => {

    const [form] = Form.useForm();
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
            console.log("Image uploaded", data)
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
        <Row align="middle" justify="center" style={{ minHeight: "70vh" }}>
            <Col>
                <Card title="Create product" style={{ width: "500px" }}>
                    <Form form={form} layout="vertical">
                        <Form.Item name="title">
                            <Input
                                value={formData.title}
                                onChange={
                                    (i) => modifyStateProperty(
                                        formData, setFormData, "title", i.currentTarget.value)}
                                size="large" 
                                type="text" 
                                placeholder="product title"></Input>
                        </Form.Item>

                        <Form.Item name="description">
                            <Input
                                value={formData.description} 
                                onChange={
                                    (i) => modifyStateProperty(
                                        formData, setFormData, "description", i.currentTarget.value)}
                                size="large" 
                                type="text" 
                                placeholder="
                                description"></Input>
                        </Form.Item>

                        <Form.Item name="price">
                            <Input 
                                value={formData.price}
                                onChange={
                                    (i) => modifyStateProperty(
                                        formData, setFormData, "price", i.currentTarget.value)}
                                size="large" 
                                type="number" 
                                placeholder="price"></Input>
                        </Form.Item>

                        <Form.Item name="image">
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
                                {formData.image ? null : "Upload"}
                            </Upload>
                        </Form.Item>
                        
                        <Form.Item
                         name="category"
                         rules={[{ required: true, message: "Selecciona una categoría" }]}
                        >
                            <Select
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
                    </Form>
                    <Button type="primary" onClick={clickCreateProduct} block>Sell Product</Button>
                </Card>
            </Col>
        </Row>
    )
}

export default CreateProductComponent;
