import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, StyleSheet, Text, View, Animated} from 'react-native';
import ScreenContainer from './ScreenContainer';

type ServerItem = {
  baseVolume: string;
  high24hr: string;
  highestBid: string;
  id: string;
  isFrozen: string;
  last: string;
  low24hr: string;
  lowestAsk: string;
  percentChange: string;
  postOnly: string;
  quoteVolume: string;
};

type Response = Record<string, ServerItem>;
type TableHead = {name: string; head: boolean};
type TableCell = ServerItem & {name: string};
type TableItem = TableHead | TableCell;

function getReturnTicker(): Promise<Response> {
  return fetch('https://poloniex.com/public?command=returnTicker').then(
    response => response.json(),
  );
}

function makeViewData(response: Response) {
  const result = [];
  const final: (TableCell | TableHead)[] = [{name: 'firstHead', head: true}];
  const num = 3;
  let counter = 0;

  for (const [key, value] of Object.entries(response)) {
    result.push({
      name: key,
      ...value,
    });
  }

  result
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(el => {
      if (++counter === num) {
        final.push({name: el.name + '' + num, head: true});
        counter = 0;
      } else {
        final.push(el);
      }
    });

  return final;
}

async function getFlatDataTable() {
  const data = await getReturnTicker();
  if (data.error) {
    throw data;
  }
  return makeViewData(data);
}

const Cell = React.memo((props: TableCell) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [props.last, props.highestBid, props.percentChange, fadeAnim]);

  return (
    <View style={[styles.cell, styles.tableContent]}>
      <Animated.View style={{opacity: fadeAnim}}>
        <Text style={(styles.text, styles.bold)}>{props.name}</Text>
        <Text style={styles.text}>{props.last}</Text>
        <Text style={styles.text}>{props.highestBid}</Text>
        <Text style={[styles.text, styles.last]}>{props.percentChange}</Text>
      </Animated.View>
    </View>
  );
});

const Head = React.memo(
  () => {
    return (
      <View style={[styles.cell, styles.tableHead]}>
        <Text style={[styles.text, styles.tableHeadText, styles.bold]}>
          name:
        </Text>
        <Text style={[styles.text, styles.tableHeadText]}>last:</Text>
        <Text style={[styles.text, styles.tableHeadText]}>highestBid:</Text>
        <Text style={[styles.text, styles.tableHeadText, styles.last]}>
          percentChange:
        </Text>
      </View>
    );
  },
  () => true,
);

function Header({error}: {error: string}) {
  return (
    <View style={styles.headContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

const updateTime = 5000;

export default function PoloTable() {
  const [tickers, setTickers] = useState<TableItem[]>();
  const [errorText, setError] = useState('');
  const [isFetching, setFetching] = useState(false);

  useEffect(() => {
    let fetching = true;
    let interval: ReturnType<typeof setInterval>;

    const fetchProcess = async () => {
      try {
        let response = await getFlatDataTable();
        setFetching(true);
        setTickers(response);
        fetching = false;
        interval = setInterval(async () => {
          if (fetching) {
            return;
          }
          setError('');
          fetching = true;
          response = await getFlatDataTable();
          setTickers(response);
          fetching = false;
        }, updateTime);
      } catch (error) {
        console.log('error', error);
        setError('Ошибка');
        fetching = false;
      }
    };

    fetchProcess();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const renderCallback = useCallback(
    ({item}: {item: TableItem}) =>
      'head' in item ? <Head /> : <Cell {...item} />,
    [],
  );

  return (
    <>
      <ScreenContainer>
        <FlatList
          refreshing={isFetching}
          data={tickers}
          renderItem={renderCallback}
          keyExtractor={item => item.name}
          numColumns={3}
        />
      </ScreenContainer>
      {errorText && <Header error={errorText} />}
    </>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
    flex: 1,
    borderLeftWidth: 1,
    paddingHorizontal: 7,
    marginBottom: 7,
  },
  text: {
    fontSize: 14,
    color: 'black',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    lineHeight: 20,
  },
  tableHead: {
    borderBottomWidth: 2,
    borderLeftWidth: 0,
  },
  tableHeadText: {
    fontWeight: '300',
    alignSelf: 'flex-end',
  },
  bold: {
    fontWeight: '700',
    color: 'black',
  },
  headContainer: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'red',
    left: 0,
    right: 0,
    top: 0,
  },
  errorText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  last: {
    borderBottomWidth: 0,
  },
  tableContent: {
    backgroundColor: 'white',
  },
});
