import "@/styles/globals.css";
import Link from "next/link";
import 'antd/dist/reset.css';
import { Layout, Menu, Avatar, Typography, Col, Row, notification } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import store from "../reducers/store"

const { Text } = Typography;

export default function App({ Component, pageProps }) {
    const [api, contextHolder] = notification.useNotification();

    const pathname = usePathname();
    let router = useRouter()
    let [login, setLogin] = useState(false);
    let [charUser,setCharUser] = useState("a")

    useEffect(() => {
        checkAll();
        setCharUser(localStorage.getItem("email")?.charAt(0))
    }, [])

    let checkAll = async () => {
        let isActive = await checkLoginIsActive()
        checkUserAccess(isActive)
    }

    let checkUserAccess= async (isActive) => {
        if (!isActive && !["/", "/login", "/register"].includes(pathname)) {
            router.push("/login"); 
        }
    }

    let checkLoginIsActive = async () => {
        if(localStorage.getItem("apiKey") == null){
            setLogin(false);
            return;
        }

        let response = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/users/isActiveApiKey",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                }
            });

        if (response.ok) {
            let jsonData = await response.json();
            setLogin(jsonData.activeApiKey)

            if (!jsonData.activeApiKey){
                router.push("/login")
            }
            return(jsonData.activeApiKey)
        } else {
            setLogin(false)
            router.push("/login")
            return (false)
        }
    }


    let disconnect = async (e) => {
        e.preventDefault();

        localStorage.removeItem("apiKey");
        localStorage.removeItem("email");
        localStorage.removeItem("userId"); 
        setLogin(false)
        router.push("/login")
    }

  let { Header, Content, Footer } = Layout;

  const openNotification = (placement, text, type) => {
        api[type]({
            message: 'Notification',
            description: text,
            placement,
        });
    };


  return (
    <Provider store={store}>
      <Layout className="layout" style={{ minHeight: "100vh" }}>
        {contextHolder}
          <Header>
            <Row>
                <Col xs= {18} sm={19} md={20} lg={21} xl = {22}>
                {!login &&
                    <Menu theme="dark" mode="horizontal" items={ [
                        { key:"logo",  label: <img src="/logo.png" width="40" height="40" />},
                        { key:"menuLogin",  icon: <LoginOutlined/>, label: <Link href="/login">Login</Link>},
                        { key:"menuRegister",  label: <Link href="/register">Register</Link>},
                    ]} >
                    </Menu>
                }
                {login &&
                    <Menu theme="dark" mode="horizontal" items={ [
                        { key:"logo",  label: <img src="/logo.png" width="40" height="40" />},
                        { key:"menuProducts",  label: <Link href="/products">Products</Link>},
                        { key:"menuCreateProduct",  label: <Link href="/createProduct">Sell</Link>},
                        { key:"menuMyProduct", label: <Link href="/myProducts">My Products</Link> },                       
                        { key:"menuTransactions", label: <Link href="/myTransactions">Transactions</Link> },
                        { key:"menuDisonnect",  label: <Link href="#" 
                            onClick={ (e) => { disconnect(e)} } >Disconnect</Link>},
                    ]} >
                    </Menu>
                }
                </Col>
                <Col xs= {6} sm={5} md = {4}  lg = {3} xl = {2} style={{display: 'flex', flexDirection: 'row-reverse' }} >
                    { login != null ? (
                        <Avatar size="large" 
                                style={{ backgroundColor: "#ff0000", verticalAlign: 'middle', marginTop: 12   }}>
                            { charUser }
                        </Avatar>
                    ) : (
                        <Link to="/login"> <Text style={{ color:"#ffffff" }}>Login</Text></Link>
                    )}
                </Col>
            </Row>
          </Header>
          <Content style={{ padding: "20px 50px" }}>
              <Component {...pageProps} setLogin={setLogin} openNotification={openNotification} />
          </Content>
          <Footer style={{ textAlign: "center" }}> Wallapep </Footer>
      </Layout>
    </Provider>
  )
}
