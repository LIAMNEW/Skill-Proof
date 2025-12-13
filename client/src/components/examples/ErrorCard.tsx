import ErrorCard from '../ErrorCard';

export default function ErrorCardExample() {
  const handleRetry = () => {
    console.log('Retry clicked');
  };

  return (
    <ErrorCard 
      message="User 'invaliduser123' not found on GitHub. Please check the username and try again."
      onRetry={handleRetry}
    />
  );
}
