import { Button } from "../ui/button";

type Props = {
  postsLength: number;
  loading: boolean;
  loadFn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const POST_LIMIT = 25;

export default function ApplicationLoadButton({
  postsLength,
  loadFn,
  loading,
}: Props) {
  return (
    <div className="my-8 flex w-full flex-col items-center">
      {loading && (
        <Button variant="default" disabled>
          loading...
        </Button>
      )}

      {!loading && postsLength < POST_LIMIT && (
        <Button onClick={loadFn} variant="default">
          more
        </Button>
      )}
      {!loading && postsLength >= POST_LIMIT && (
        <Button onClick={loadFn} variant="ghost" disabled>
          go outside
        </Button>
      )}
    </div>
  );
}
