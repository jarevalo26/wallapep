
import {useState, useEffect  } from "react";
import { Table, Space  } from 'antd';
import Link from "next/link";
import { timestampToString } from "../../../utils/UtilsDates";

let ListMyProductsComponent = () => {
    let [products, setProducts] = useState([])

    useEffect(() => {
        getMyProducts();
    }, [])

    let deleteProduct = async (id) => {
        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/products/"+id,
            {
                method: "DELETE",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            });

        if ( response.ok ){
            let jsonData = await response.json();
            if ( jsonData.deleted){
                let productsAftherDelete = products.filter(p => p.id != id)
                setProducts(productsAftherDelete)
            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }


    let getMyProducts = async () => {
        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/products/own/",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            });

        if ( response.ok ){
            let jsonData = await response.json();
            jsonData.map( product => {
                product.key = product.id
                return product
            })
            setProducts(jsonData)
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }

    let columns = [
        {
            title: "Id",
            dataIndex: "id",
        },
        {
            title: "Seller Id",
            dataIndex: "sellerId"
        },
        {
            title: "Title",
            dataIndex: "title"
        },
        {
            title: "Description",
            dataIndex: "description",
        },
        {
            title: "Price (€)",
            dataIndex: "price",
        },
        {
            title: "Date",
            dataIndex: "date",
            render: (date) => timestampToString(date)
        },
        {
            title: "Buyer",
            dataIndex: [],
            render: (product) =>
                <Link href={"/user/"+product.buyerId}>{ product.buyerEmail }</Link>
        },
        {
            title: "Actions",
            dataIndex: "id",
            render: (id) => 
                <Space.Compact direction="vertical">
                    <Link href={"/editProduct/"+id} style={ { width: "100%"}}>Edit</Link>
                    <Link href={"#"} onClick={ () => deleteProduct(id) }>Delete</Link>
                </Space.Compact>
        },

    ]

    return (
        <Table columns={columns} dataSource={products}></Table>
    )
}

export default ListMyProductsComponent;
