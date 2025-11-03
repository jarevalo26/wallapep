import { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

export default function BuyButton({ product, currentUserId, onSuccess }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificar si el usuario puede comprar este producto
  const canBuy = () => {
    // Usuario no logueado
    if (!currentUserId) {
      return { can: false, reason: 'login' };
    }

    // Producto ya vendido
    if (product.sold) {
      return { can: false, reason: 'sold' };
    }

    // Es mi propio producto
    if (product.userId === currentUserId) {
      return { can: false, reason: 'own' };
    }

    return { can: true };
  };

  const checkResult = canBuy();

  // Manejar clic en el botón
  const handleBuyClick = () => {
    if (!checkResult.can) {
      if (checkResult.reason === 'login') {
        message.warning('Debes iniciar sesión para comprar');
        router.push('/login');
        return;
      }
      return;
    }
    setIsModalVisible(true);
  };

  // Confirmar compra
  const handleConfirmPurchase = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_BASE_URL + '/transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': localStorage.getItem('apiKey') || ''
          },
          body: JSON.stringify({
            productId: product.id,
            buyerPaymentId: null // Por ahora siempre null
          })
        }
      );

      if (response.ok) {
        const transaction = await response.json();
        setIsModalVisible(false);
        
        // Mostrar modal de éxito
        Modal.success({
          title: '¡Compra exitosa!',
          content: (
            <div>
              <p>Has comprado: <strong>{product.title}</strong></p>
              <p>Precio: <strong>€{product.price}</strong></p>
              <p>El vendedor ha sido notificado de tu compra.</p>
            </div>
          ),
          okText: 'Ver mis compras',
          cancelText: 'Cerrar',
          onOk: () => {
            router.push('/myTransactions');
          },
          okCancel: true
        });

        // Callback para actualizar el producto en la página padre
        if (onSuccess) {
          onSuccess(transaction);
        }

      } else {
        // Manejar errores del backend
        const errorData = await response.json();
        
        if (errorData.errors && errorData.errors.length > 0) {
          const error = errorData.errors[0];
          
          switch (error.code) {
            case 404:
              message.error('Producto no encontrado');
              break;
            case 400:
              message.error(error.msg || 'No se pudo realizar la compra');
              break;
            case 401:
              message.error('Debes iniciar sesión');
              router.push('/login');
              break;
            default:
              message.error('Error al realizar la compra. Intenta de nuevo.');
          }
        } else {
          message.error('Error al realizar la compra');
        }
      }

    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar compra
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Determinar el estado del botón y su texto
  const getButtonProps = () => {
    if (!checkResult.can) {
      switch (checkResult.reason) {
        case 'login':
          return {
            disabled: false,
            text: 'Iniciar sesión para comprar',
            icon: <ShoppingCartOutlined />
          };
        case 'sold':
          return {
            disabled: true,
            text: 'Producto vendido',
            icon: null
          };
        case 'own':
          return {
            disabled: true,
            text: 'No puedes comprar tu propio producto',
            icon: null
          };
      }
    }

    return {
      disabled: false,
      text: 'Comprar ahora',
      icon: <ShoppingCartOutlined />
    };
  };

  const buttonProps = getButtonProps();

  return (
    <>
      <Button
        type="primary"
        size="large"
        block
        icon={buttonProps.icon}
        disabled={buttonProps.disabled}
        onClick={handleBuyClick}
        style={{ marginTop: 16 }}
      >
        {buttonProps.text}
      </Button>

      <Modal
        title="Confirmar compra"
        open={isModalVisible}
        onOk={handleConfirmPurchase}
        onCancel={handleCancel}
        okText="Confirmar compra"
        cancelText="Cancelar"
        confirmLoading={loading}
      >
        <div style={{ padding: '20px 0' }}>
          <p><strong>Producto:</strong> {product.title}</p>
          <p><strong>Precio:</strong> €{product.price}</p>
          {product.description && (
            <p><strong>Descripción:</strong> {product.description}</p>
          )}
          
          <div style={{ 
            marginTop: 24, 
            padding: 16, 
            backgroundColor: '#f0f0f0', 
            borderRadius: 8 
          }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              ¿Estás seguro de que quieres comprar este producto?
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}