import CreateProductComponent from "./components/products/CreateProductComponent";

export default function LoginPage({setLogin, openNotification}) {

  return (
    <div>
      <CreateProductComponent openNotification={openNotification} />
    </div>
  );
}