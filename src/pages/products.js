import ListProductsComponent from './components/products/ListProductsComponent';

export default function ProductsPage() {
  return (
    <ListProductsComponent 
      showCategoryCards={false}
      showTitle={true}
    />
  );
}