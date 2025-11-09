import { useState } from "react";
import { useRouter } from "next/router";
import { modifyStateProperty } from "../../../utils/UtilsState";
import { Card, Col, Row, Form, Input, Button, Typography, Space } from "antd";
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import {
    validateFormDataInputRequired,
    validateFormDataInputEmail,
    allowSubmitForm,
    setServerErrors,
    joinAllServerErrorMessages
} from "../../../utils/UtilsValidations"

const { Title, Text } = Typography;

let LoginFormComponent = ({ setLogin, openNotification }) => {
    let router = useRouter()

    let requiredInForm = ["email", "password"]
    let [formErrors, setFormErrors] = useState({})
    let [formData, setFormData] = useState({})
    let [loading, setLoading] = useState(false)

    let clickLogin = async () => {
        setLoading(true)
        
        let response = await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (response.ok) {
            let responseBody = await response.json();
            if (responseBody.apiKey && responseBody.email) {
                localStorage.setItem("apiKey", responseBody.apiKey)
                localStorage.setItem("email", responseBody.email)

                if (responseBody.id) {
                    localStorage.setItem("userId", responseBody.id)
                }
            }
            setLogin(true)
            openNotification("top", "Inicio de sesión exitoso", "success")
            router.push("/");
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;

            setServerErrors(serverErrors, setFormErrors)
            let notificationMsg = joinAllServerErrorMessages(serverErrors)
            openNotification("top", notificationMsg, "error")
        }
        
        setLoading(false)
    }

    return (
        <Row align="middle" justify="center" style={{ minHeight: "70vh", padding: "24px 0" }}>
            {/* Imagen lateral - solo en pantallas medianas+ */}
            <Col xs={0} sm={0} md={12} lg={8} xl={6}>
                <img src="/iniciar-sesion.png" width="100%" alt="Iniciar sesión" />
            </Col>

            {/* Formulario */}
            <Col xs={24} sm={24} md={12} lg={12} xl={10}>
                <Card 
                    style={{ 
                        width: "100%", 
                        maxWidth: 500,
                        margin: "0 auto",
                        padding: "8px"
                    }}
                >
                    {/* Título y descripción - Pauta 1.6 (textos clave destacados) */}
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Title level={2} style={{ marginBottom: 8 }}>
                                Iniciar sesión
                            </Title>
                            <Text type="secondary">
                                Ingresa a tu cuenta de Wallapep
                            </Text>
                        </div>

                        <Form layout="vertical">
                            {/* Campo Email - Pauta 4.13 (errores en línea) */}
                            <Form.Item
                                label={<Text strong>Email</Text>}
                                validateStatus={
                                    validateFormDataInputEmail(formData, "email", formErrors, setFormErrors) 
                                        ? "success" 
                                        : formData.email ? "error" : ""
                                }
                                help={
                                    formErrors?.email && (
                                        <Text type="danger" style={{ fontSize: '12px' }}>
                                            {formErrors.email.msg}
                                        </Text>
                                    )
                                }
                                style={{ marginBottom: 24 }}
                            >
                                <Input
                                    size="large"
                                    prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(i) => {
                                        modifyStateProperty(formData, setFormData, "email", i.currentTarget.value)
                                        if (formErrors.email) {
                                            setFormErrors(prev => ({ ...prev, email: null }))
                                        }
                                    }}
                                />
                            </Form.Item>

                            {/* Campo Contraseña - Pauta 4.13 (errores en línea) */}
                            <Form.Item
                                label={<Text strong>Contraseña</Text>}
                                validateStatus={
                                    validateFormDataInputRequired(formData, "password", formErrors, setFormErrors) 
                                        ? "success" 
                                        : formData.password ? "error" : ""
                                }
                                help={
                                    formErrors?.password && (
                                        <Text type="danger" style={{ fontSize: '12px' }}>
                                            {formErrors.password.msg}
                                        </Text>
                                    )
                                }
                                style={{ marginBottom: 24 }}
                            >
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Tu contraseña"
                                    value={formData.password}
                                    onChange={(i) => {
                                        modifyStateProperty(formData, setFormData, "password", i.currentTarget.value)
                                        if (formErrors.password) {
                                            setFormErrors(prev => ({ ...prev, password: null }))
                                        }
                                    }}
                                />
                            </Form.Item>

                            {/* Botón - Pauta 1.9 (tarea principal destacada) */}
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={clickLogin}
                                    disabled={!allowSubmitForm(formData, formErrors, requiredInForm)}
                                    loading={loading}
                                >
                                    Iniciar sesión
                                </Button>
                            </Form.Item>

                            {/* Link registro - Pauta 3.18 (orden natural) */}
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <Text type="secondary">¿No tienes cuenta? </Text>
                                <a onClick={() => router.push('/register')}>
                                    Regístrate aquí
                                </a>
                            </div>
                        </Form>
                    </Space>
                </Card>
            </Col>
        </Row>
    )
}

export default LoginFormComponent;