
import {useState, useEffect  } from "react";
import { Table, Space, Button, Typography, Modal, message, Tag, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Link from "next/link";
import { timestampToString } from "../../../utils/UtilsDates";

const { Title, Text } = Typography;
const { confirm } = Modal;

let ListMyProductsComponent = () => {
    let [products, setProducts] = useState([])
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyProducts();
    }, [])

    // Confirmación antes de borrar - Pauta 5.3
    let confirmDelete = (product) => {
        confirm({
            title: '¿Eliminar producto?',
            icon: <ExclamationCircleOutlined />,
            content: `¿Estás seguro de eliminar "${product.title}"? Esta acción no se puede deshacer.`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                deleteProduct(product.id);
            },
        });
    };

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
                message.success('Producto eliminado correctamente');
            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
            message.error('Error al eliminar el producto');
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
        setLoading(false);
    }

    // Columnas en español - Pauta 1.2
    let columns = [
        {
            title: "Título",
            dataIndex: "title",
            key: "title",
            render: (title) => <Text strong>{title}</Text>
        },
        {
            title: "Descripción",
            dataIndex: "description",
            key: "description",
            // Pauta 3.10 - limitar información
            render: (desc) => (
                <Text ellipsis style={{ maxWidth: 200 }}>
                    {desc || '-'}
                </Text>
            )
        },
        {
            title: "Precio",
            dataIndex: "price",
            key: "price",
            // Pauta 3.11 - alineado a la derecha
            align: 'right',
            render: (price) => (
                <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                    €{price}
                </Text>
            )
        },
        {
            title: "Estado",
            dataIndex: "buyerId",
            key: "status",
            // Pauta 3.22 - elementos no activos
            render: (buyerId) => (
                buyerId ? 
                    <Tag color="red">Vendido</Tag> : 
                    <Tag color="green">Disponible</Tag>
            )
        },
        {
            title: "Comprador",
            dataIndex: "buyerEmail",
            key: "buyer",
            render: (buyerEmail, product) => 
                buyerEmail ? (
                    <Link href={"/profile/" + product.buyerId}>
                        {buyerEmail}
                    </Link>
                ) : (
                    <Text type="secondary">-</Text>
                )
        },
        {
            title: "Fecha",
            dataIndex: "date",
            key: "date",
            render: (date) => timestampToString(date)
        },
        {
            title: "Acciones",
            dataIndex: "id",
            key: "actions",
            fixed: 'right',
            width: 150,
            // Pauta 1.13 - pocas acciones visibles
            render: (id, product) => (
                <Space size="small">
                    <Link href={"/detailProduct/" + id}>
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />}
                            title="Ver"
                        />
                    </Link>
                    <Link href={"/editProduct/" + id}>
                        <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            title="Editar"
                        />
                    </Link>
                    <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => confirmDelete(product)}
                        title="Eliminar"
                    />
                </Space>
            )
        },
    ]

    return (
        // <Table columns={columns} dataSource={products}></Table>
        <div style={{ padding: '24px' }}>
            {/* Título - Pauta 1.6 */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    Mis productos
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                    Gestiona los productos que has publicado
                </Text>
            </div>

            {/* Contador - Pauta 3.16 */}
            {!loading && (
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>
                        {products.length}
                    </Text>
                    <Text style={{ marginLeft: 8, color: 'rgba(0, 0, 0, 0.65)' }}>
                        {products.length === 1 ? 'producto' : 'productos'}
                    </Text>
                </div>
            )}

            {/* Loading - Pauta 5.2 */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Spin 
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        size="large"
                    />
                    <Title level={4} style={{ marginTop: 24, color: 'rgba(0, 0, 0, 0.45)' }}>
                        Cargando productos...
                    </Title>
                </div>
            ) : (
                <Table 
                    columns={columns} 
                    dataSource={products}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total: ${total} productos`,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50']
                    }}
                    scroll={{ x: 1000 }}
                    // Pauta 3.17 - estado vacío
                    locale={{
                        emptyText: (
                            <div style={{ padding: '40px 0' }}>
                                <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                                <Title level={4}>No tienes productos publicados</Title>
                                <Text type="secondary">
                                    Comienza a vender publicando tu primer producto
                                </Text>
                                <div style={{ marginTop: 24 }}>
                                    <Link href="/createProduct">
                                        <Button type="primary" size="large">
                                            Publicar producto
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )
                    }}
                />
            )}
        </div>
    )
}

export default ListMyProductsComponent;
