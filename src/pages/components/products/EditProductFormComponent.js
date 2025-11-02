import {useState, useEffect } from "react";
import { Card, Input, Button, Row, Col, Form, Typography, DatePicker } from "antd";
import {modifyStateProperty} from "../../../utils/UtilsState";
import {timestampToDate, dateFormatTemplate } from "../../../utils/UtilsDates";

let EditProductFormComponent = ({id}) => {
    let [formData, setFormData] = useState({})

    useEffect(() => {
        getProduct(id);
    }, [])

    let getProduct = async (id) => {
         let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/products/"+id,
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            });

        if ( response.ok ){
            let jsonData = await response.json();
            setFormData(jsonData)
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }

    let clickEditProduct = async () => {
        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/products/"+id,
            {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json ",
                    "apikey": localStorage.getItem("apiKey")
                },
                body: JSON.stringify(formData)
            });

        if ( response.ok ){
            let jsonData = await response.json();
            
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }


    return (
        <Row align="middle" justify="center" style={{ minHeight: "70vh"}}>
            <Col>
                <Card title="Edit product" style={{ width: "500px"}}>

                    <Form.Item label="">
                        <Input onChange = { 
                            (i) => modifyStateProperty(formData, setFormData,"title",i.currentTarget.value) }
                            size="large" type="text" placeholder="product title"
                            value={formData?.title}>
                        </Input>
                    </Form.Item>

                    <Form.Item label="">
                        <Input onChange = {
                            (i) => modifyStateProperty(formData, setFormData,"description",i.currentTarget.value) }
                            size="large"  type="text" placeholder="description"
                            value={formData?.description}>
                        </Input>
                    </Form.Item>

                    <Form.Item label="">
                        <Input onChange = { 
                            (i) => modifyStateProperty(formData, setFormData,"price",i.currentTarget.value) }
                            size="large"  type="number" placeholder="price"
                            value={formData?.price}>
                        </Input>
                    </Form.Item>

                    <Form.Item label="">
                        <DatePicker value={ formData.date && timestampToDate(formData.date) }
                                    format={ dateFormatTemplate }
                                    onChange={ (inDate, inString) => {
                                        console.log(inString)
                                    } }
                        />
                    </Form.Item>

                    <Button type="primary" onClick={clickEditProduct}  block >Edit Product</Button> 
                </Card>
            </Col>
        </Row>

    )
}

export default EditProductFormComponent;
