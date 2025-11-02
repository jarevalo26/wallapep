import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Col, Row } from 'antd';

let ListProductsComponent = () => {
  let [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);


  let checkURL = async (url) => {
      try {
          let response = await fetch(url);
          console.log(response.ok)
          return response.ok;
      } catch (error) {
          return false; 
      }
  }


  let getProducts = async () => {
    let response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/products",
      {
        method: "GET",
        headers: {
          apikey: localStorage.getItem("apiKey"),
        },
      }
    );

    if (response.ok) {
      let jsonData = await response.json();

      let promisesForImages = jsonData.map( async p =>  {
          let urlImage = process.env.NEXT_PUBLIC_BACKEND_BASE_URL+"/images/"+p.id+".png"
          let existsImage = await checkURL(urlImage);
          if ( existsImage )
              p.image = urlImage
          else
              p.image = "/imageMockup.png"
          return p
      })

      let productsWithImage = await Promise.all(promisesForImages)
      setProducts(productsWithImage)

    } else {
      let responseBody = await response.json();
      let serverErrors = responseBody.errors;
      serverErrors.forEach((e) => {
        console.log("Error: " + e.msg);
      });
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <Row gutter={ [16, 16] } >
            { products.map( p =>
                <Col span={8} >
                   <Link href={`detailProduct/${p.id}`}>
                      <Card key={p.id} title={ p.title }   cover={ <img src= { p.image } /> }>
                          { p.price } 
                      </Card>
                    </Link>
                </Col>
             )}
      </Row>
    </div>
  );
};

export default ListProductsComponent;