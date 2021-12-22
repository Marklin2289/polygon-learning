import {CHAINS, ChainPropT} from 'types';
import {getStaticPropsForChain} from 'utils/pages';
import Layout from 'components/shared/Layout';
import {Pyth} from 'components/protocols';

export async function getStaticProps() {
  return getStaticPropsForChain(CHAINS.PYTH);
}

const Protocol = (props: ChainPropT) => {
  const {markdown, chain} = props;
  return (
    <Layout markdown={markdown} chain={chain}>
      <Pyth />
    </Layout>
  );
};

export default Protocol;
