import { useState, useRef } from "react";
import { useRouter } from "next/router";
import {modifyStateProperty} from "../../../utils/UtilsState";
import {Card, Col, Row, Form, Input, Button , Typography } from "antd";
import {
    validateFormDataInputRequired,
    validateFormDataInputEmail,
    allowSubmitForm,
    setServerErrors,
    joinAllServerErrorMessages
 } from "../../../utils/UtilsValidations"

let LoginFormComponent = ({setLogin, openNotification}) => {
    let router = useRouter()

    // validación
    let requiredInForm = ["email","password"]
    let [formErrors, setFormErrors] = useState({})
 
    let [formData,setFormData] = useState({

    })

    let clickLogin = async () => {
        let response = await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/users/login",{
            method: "POST",
            headers: { "Content-Type" : "application/json "},
            body: JSON.stringify(formData)
        })

        if (response.ok){
            let responseBody = await response.json();
            if ( responseBody.apiKey && responseBody.email){
                localStorage.setItem("apiKey",responseBody.apiKey)
                localStorage.setItem("email",responseBody.email)

                if (responseBody.id) {
                    localStorage.setItem("userId", responseBody.id)
                }
            }
            console.log("ok "+responseBody)
            setLogin(true)
            openNotification("top", "Login successfull", "success")
            router.push("/products");
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;

            setServerErrors(serverErrors,setFormErrors)
            let notificationMsg = joinAllServerErrorMessages(serverErrors)
            openNotification("top",notificationMsg, "error" )
        }

    }

    return (
        <Row align="middle" justify="center" style={{ minHeight: "70vh"}}>
            <Col xs={0} sm={0} md={12} lg={8} xl={6}  ><img src="/iniciar-sesion.png" width="100%"/></Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={10} >
                <Card title="Login" style={{ width: "100%", margin: "15px"}}>

            {formErrors?.email?.msg &&
                    <Typography.Text type="danger"> {formErrors?.email?.msg} </Typography.Text>}
            <Form.Item label=""  key="email-input" name="email" validateStatus={
                validateFormDataInputEmail(
                    formData, "email", formErrors, setFormErrors) ? "success" : "error"}>
                <Input placeholder="your email"
                    value={formData.email}
                    onChange={(i) => {
                    modifyStateProperty(formData, setFormData,
                        "email", i.currentTarget.value)
                }}/>
            </Form.Item>

            {formErrors?.password?.msg &&
                <Typography.Text type="danger"> {formErrors?.password?.msg} </Typography.Text>}
            <Form.Item label="" name="password" validateStatus={
                validateFormDataInputRequired(
                    formData, "password", formErrors, setFormErrors) ? "success" : "error"}>
                <Input.Password
                    placeholder="your password"
                    onChange={(i) => {
                    modifyStateProperty(formData, setFormData,
                        "password", i.currentTarget.value)
                }}/>
            </Form.Item>


            <Form.Item>
                { allowSubmitForm(formData,formErrors,requiredInForm) ?
                    <Button type="primary" onClick={clickLogin} block >Login</Button> :
                    <Button type="primary" block disabled>Login</Button>
                }
            </Form.Item>
                </Card>
            </Col>
    </Row>

    )
}

export default LoginFormComponent;
