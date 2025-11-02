import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Select } from "antd";
import { modifyStateProperty } from "../../../utils/UtilsState";

const CreateUserComponent = ({ openNotification }) => {

    const [form] = Form.useForm();
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
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email inválido" }]}>
                <Input 
                    value={formData.email} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "email", e.target.value)} />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={[{ required: true, message: "Password obligatorio" }]}>
                <Input.Password 
                    value={formData.password} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "password", e.target.value)} />
            </Form.Item>

            <Form.Item name="name" label="Nombre">
                <Input 
                    value={formData.name} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "name", e.target.value)} />
            </Form.Item>

            <Form.Item 
                name="surname" label="Apellidos">
                <Input value={formData.surname} onChange={(e) => modifyStateProperty(formData, setFormData, "surname", e.target.value)} />
            </Form.Item>

            <Form.Item name="documentIdentity" label="Tipo de documento">
                <Select value={formData.documentIdentity} onChange={(val) => modifyStateProperty(formData, setFormData, "documentIdentity", val)}>
                    <Select.Option value="DNI">DNI</Select.Option>
                    <Select.Option value="Passport">Passport</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item name="documentNumber" label="Número de documento">
                <Input 
                    value={formData.documentNumber} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "documentNumber", e.target.value)} 
                />
            </Form.Item>

            <Form.Item name="country" label="País">
                <Input 
                    value={formData.country} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "country", e.target.value)} 
                />
            </Form.Item>

            <Form.Item name="address" label="Dirección">
                <Input 
                    value={formData.address} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "address", e.target.value)} 
                />
            </Form.Item>

            <Form.Item name="postalCode" label="Código postal">
                <Input 
                    value={formData.postalCode} 
                    onChange={(e) => modifyStateProperty(formData, setFormData, "postalCode", e.target.value)} 
                />
            </Form.Item>

            <Form.Item name="birthday" label="Fecha de nacimiento">
                <DatePicker
                    style={{ width: "100%" }}
                    onChange={(date) => {
                        const ts = date ? (date.valueOf ? date.valueOf() : new Date(date).getTime()) : null;
                        modifyStateProperty(formData, setFormData, "birthday", ts);
                    }}
                />
            </Form.Item>

            <Form.Item>
                <Button 
                    type="primary" 
                    htmlType="submit"
                >Crear usuario</Button>
            </Form.Item>
        </Form>
    );
};

export default CreateUserComponent;