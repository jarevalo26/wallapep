import { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

export default function BuyButton({ product, currentUserId, onSuccess, openNotification }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificar si el usuario puede comprar
  const canBuy = () => {
    if (!currentUserId) {
      return { can: false, reason: 'login' };
    }
    if (product.buyerId !== null && product.buyerId !== undefined) {
      return { can: false, reason: 'sold' };
    }
    if (product.sellerId === currentUserId) {
      return { can: false, reason: 'own' };
    }
    return { can: true };
  };

  const checkResult = canBuy();

  // Abrir modal
  const showModal = () => {
    if (!checkResult.can) {
      if (checkResult.reason === 'login') {
        message.warning('Debes iniciar sesión para comprar');
        router.push('/login');
      }
      return;
    }
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Confirmar compra
  const handleOk = async () => {
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
            buyerPaymentId: null
          })
        }
      );

      if (response.ok) {
        const transaction = await response.json();
        setIsModalOpen(false);
        if (onSuccess) {
          onSuccess(transaction);
        }
      } else {
        const errorData = await response.json();
        message.error(errorData.errors?.[0]?.msg || 'Error al realizar la compra');
      }
    } catch (error) {
      message.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Determinar props del botón
  const getButtonProps = () => {
    if (!checkResult.can) {
      switch (checkResult.reason) {
        case 'login':
          return { disabled: false, text: 'Iniciar sesión para comprar' };
        case 'sold':
          return { disabled: true, text: 'Producto vendido' };
        case 'own':
          return { disabled: true, text: 'No puedes comprar tu propio producto' };
      }
    }
    return { disabled: false, text: 'Comprar ahora' };
  };

  const buttonProps = getButtonProps();

  return (
    <>
      <Button
        type="primary"
        size="large"
        block
        icon={<ShoppingCartOutlined />}
        disabled={buttonProps.disabled}
        onClick={showModal}
        style={{ marginTop: 16 }}
      >
        {buttonProps.text}
      </Button>

      <Modal
        title="Confirmar compra"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Confirmar compra"
        cancelText="Cancelar"
        confirmLoading={loading}
      >
        <p><strong>Producto:</strong> {product.title}</p>
        <p><strong>Precio:</strong> €{product.price}</p>
        {product.description && (
          <p><strong>Descripción:</strong> {product.description}</p>
        )}
        <p style={{ marginTop: 16, color: '#666' }}>
          ¿Estás seguro de que quieres comprar este producto?
        </p>
      </Modal>
    </>
  );
}