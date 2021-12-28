
import EthereumIcon from '../public/images/ethereum-eth-logo.svg';
import PolygonIcon from '../public/images/polygon-matic-logo.svg';

export default function Logo ({ chainId, width = 24 }: { chainId: number, width?: number }) {
  return (
    (chainId === 1 || chainId === 4)
      ? <EthereumIcon width={width} height={width} />
      : <PolygonIcon width={width} height={width} />
  );
}