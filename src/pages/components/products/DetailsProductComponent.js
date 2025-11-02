import {useState, useEffect } from "react";
import { Typography, Card, Descriptions, Image, Button  } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';

let DetailsProductComponent  = ({id}) => {
    let [product, setProduct] = useState({})

    useEffect(() => {
        getProduct(id);
    }, [])

    let buyProduct = async () => {
        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/transactions/",
            {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json ",
                    "apikey": localStorage.getItem("apiKey")
                },
                body: JSON.stringify({
                    productId: id
                })
            });

        if ( response.ok ){
            let jsonData = await response.json();
            if (jsonData.affectedRows == 1){

            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }


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
            setProduct(jsonData)
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }

    const { Text } = Typography;
    let labelProductPrice = "No-Oferta"
    if ( product.price < 10000){
        labelProductPrice="Oferta"
    }


    return (
    <Card>
        <Image src="/item1.png" />
        <Descriptions title={ product.title }>
            <Descriptions.Item label="Id">
                { product.id }
            </Descriptions.Item>
            <Descriptions.Item label="Description">
                { product.description }
            </Descriptions.Item>
            <Descriptions.Item >
                <Text strong underline style={{ fontSize:20 }}>{ product.price }</Text>
                { labelProductPrice }
            </Descriptions.Item>
                <Descriptions.Item>
                <Button type="primary" onClick={buyProduct}
                        icon={<ShoppingOutlined/>} size="large">
                    Buy
                </Button>
            </Descriptions.Item>

        </Descriptions>
    </Card>

    )
}

export default DetailsProductComponent;
