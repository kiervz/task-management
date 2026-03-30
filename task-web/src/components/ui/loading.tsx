import { Spinner } from './spinner';

const Loading = ({ message = 'Loading...' }: { message: string }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Spinner className="size-8" />
      <p className="p-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default Loading;
