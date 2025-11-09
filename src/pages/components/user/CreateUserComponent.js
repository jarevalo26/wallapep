import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Select, Card, Typography, Space, Divider, Row, Col } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, IdcardOutlined, HomeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { modifyStateProperty } from "../../../utils/UtilsState";

const { Title, Text } = Typography;

const CreateUserComponent = ({ openNotification }) => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        surname: "",
        documentIdentity: "",
        documentNumber: "",
        country: "",
        address: "",
        postalCode: "",
        birthday: null
    });

    const onFinish = async () => {
        setLoading(true);

        const payload = {
            email: formData.email || null,
            password: formData.password || null,
            name: formData.name || null,
            surname: formData.surname || null,
            documentIdentity: formData.documentIdentity || null,
            documentNumber: formData.documentNumber || null,
            country: formData.country || null,
            address: formData.address || null,
            postalCode: formData.postalCode || null,
            birthday: formData.birthday || null
        };

        try {
            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": localStorage.getItem("apiKey") || ""
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (res.ok) {
                if (typeof openNotification === "function") {
                    openNotification("top", "Usuario creado exitosamente", "success");
                }
                form.resetFields();
                setFormData({
                    email: "",
                    password: "",
                    name: "",
                    surname: "",
                    documentIdentity: "",
                    documentNumber: "",
                    country: "",
                    address: "",
                    postalCode: "",
                    birthday: null
                });
            } else {
                const err = await res.json().catch(() => ({}));
                const msg = err.message || JSON.stringify(err) || "Error al crear usuario";
                if (typeof openNotification === "function") {
                    openNotification("top", msg, "error");
                }
            }
        } catch (e) {
            console.error(e);
            if (typeof openNotification === "function") {
                openNotification("top", "Error de red al crear usuario", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row justify="center" style={{ padding: "24px 0" }}>
            <Col xs={24} sm={22} md={20} lg={16} xl={12}>
                <Card>
                    {/* Título principal - Pauta 1.6 */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Title level={2} style={{ marginBottom: 8 }}>
                            Crear cuenta
                        </Title>
                        <Text type="secondary">
                            Completa tus datos para registrarte en Wallapep
                        </Text>
                    </div>

                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        
                        {/* SECCIÓN 1: Cuenta - Pauta 1.8 (agrupación) */}
                        <div style={{ marginBottom: 32 }}>
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <MailOutlined /> Datos de acceso
                            </Title>
                            
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="email" 
                                        label={<Text strong>Email</Text>}
                                        rules={[
                                            { required: true, message: "Email obligatorio" },
                                            { type: "email", message: "Email inválido" }
                                        ]}
                                    >
                                        <Input 
                                            size="large"
                                            prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="tu@email.com"
                                            value={formData.email} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "email", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="password" 
                                        label={<Text strong>Contraseña</Text>}
                                        rules={[{ required: true, message: "Contraseña obligatoria" }]}
                                    >
                                        <Input.Password 
                                            size="large"
                                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="Mínimo 8 caracteres"
                                            value={formData.password} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "password", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* SECCIÓN 2: Datos personales - Pauta 1.8 */}
                        <div style={{ marginBottom: 32 }}>
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <UserOutlined /> Datos personales
                            </Title>
                            
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="name" 
                                        label={<Text strong>Nombre</Text>}
                                    >
                                        <Input 
                                            size="large"
                                            placeholder="Tu nombre"
                                            value={formData.name} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "name", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="surname" 
                                        label={<Text strong>Apellidos</Text>}
                                    >
                                        <Input 
                                            size="large"
                                            placeholder="Tus apellidos"
                                            value={formData.surname} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "surname", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24}>
                                    <Form.Item 
                                        name="birthday" 
                                        label={<Text strong>Fecha de nacimiento</Text>}
                                    >
                                        <DatePicker
                                            size="large"
                                            style={{ width: "100%" }}
                                            placeholder="Selecciona tu fecha"
                                            onChange={(date) => {
                                                const ts = date ? (date.valueOf ? date.valueOf() : new Date(date).getTime()) : null;
                                                modifyStateProperty(formData, setFormData, "birthday", ts);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* SECCIÓN 3: Documentación - Pauta 1.8 */}
                        <div style={{ marginBottom: 32 }}>
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <IdcardOutlined /> Documentación
                            </Title>
                            
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="documentIdentity" 
                                        label={<Text strong>Tipo de documento</Text>}
                                    >
                                        <Select 
                                            size="large"
                                            placeholder="Selecciona tipo"
                                            value={formData.documentIdentity} 
                                            onChange={(val) => modifyStateProperty(formData, setFormData, "documentIdentity", val)}
                                        >
                                            <Select.Option value="DNI">DNI</Select.Option>
                                            <Select.Option value="Passport">Pasaporte</Select.Option>
                                            <Select.Option value="Other">Otro</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="documentNumber" 
                                        label={<Text strong>Número de documento</Text>}
                                    >
                                        <Input 
                                            size="large"
                                            placeholder="12345678X"
                                            value={formData.documentNumber} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "documentNumber", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* SECCIÓN 4: Dirección - Pauta 1.8 */}
                        <div style={{ marginBottom: 32 }}>
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <HomeOutlined /> Dirección
                            </Title>
                            
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="country" 
                                        label={<Text strong>País</Text>}
                                    >
                                        <Input 
                                            size="large"
                                            prefix={<EnvironmentOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="España"
                                            value={formData.country} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "country", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="postalCode" 
                                        label={<Text strong>Código postal</Text>}
                                    >
                                        <Input 
                                            size="large"
                                            placeholder="28001"
                                            maxLength={5}
                                            value={formData.postalCode} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "postalCode", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24}>
                                    <Form.Item 
                                        name="address" 
                                        label={<Text strong>Dirección</Text>}
                                    >
                                        <Input 
                                            size="large"
                                            placeholder="Calle, número, piso, puerta"
                                            value={formData.address} 
                                            onChange={(e) => modifyStateProperty(formData, setFormData, "address", e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Botón submit - Pauta 1.9 */}
                        <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                            <Button 
                                type="primary"
                                size="large"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                Crear cuenta
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default CreateUserComponent;