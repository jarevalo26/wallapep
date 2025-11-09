import { useRouter } from "next/router";
import EditProductFormComponent from "../components/products/EditProductFormComponent";
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query; 

  const clickReturn = () => {
    router.push("/products");
  };

  return (
    <div>
      <h1>Editar producto {id}</h1>
      <EditProductFormComponent id = {id} />
      <Button 
        onClick={clickReturn}
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
      >
        Volver a productos
      </Button>
    </div>
  );
}