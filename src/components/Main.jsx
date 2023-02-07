import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Image,
    Input,
    SimpleGrid,
    Text,
} from '@chakra-ui/react';
import { useAccount, useEnsAddress } from "wagmi"
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';

import { API_KEY } from "../constants"

export default function Main() {
    const { address } = useAccount();
    const [userAddress, setUserAddress] = useState('');
    const [results, setResults] = useState([]);
    const [hasQueried, setHasQueried] = useState(false);
    const [tokenDataObjects, setTokenDataObjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    async function getTokenBalance(self = false) {
        const config = {
            apiKey: API_KEY,
            network: Network.ETH_GOERLI,
        };

        const alchemy = new Alchemy(config);
        let toQueryAddr = userAddress;

        if (self) toQueryAddr = address;

        if (!self && toQueryAddr === '')
            return window.alert("The address field is empty")

        if (!toQueryAddr.startsWith("0x")) {
            const { data, isError } = useEnsAddress({
                name: toQueryAddr,
            })

            if (isError)
                return window.alert("Invalid address");

            toQueryAddr = data
        }

        setIsLoading(true);
        const data = await alchemy.core.getTokenBalances(toQueryAddr);

        setResults(data);

        const tokenDataPromises = [];

        for (let i = 0; i < data.tokenBalances.length; i++) {
            const tokenData = alchemy.core.getTokenMetadata(
                data.tokenBalances[i].contractAddress
            );
            tokenDataPromises.push(tokenData);
        }

        setTokenDataObjects(await Promise.all(tokenDataPromises));
        setHasQueried(true);
        setIsLoading(false);
    }

    const parseLargeStrings = (s) => {
        if (s.length > 14) {
            const start = s.substring(0, 4);
            const end = s.substring(9)
            return start + "..." + end;
        }

        return s
    }

    return (
        <>
            <Center>
                <Flex
                    alignItems={'center'}
                    justifyContent="center"
                    flexDirection={'column'}
                >
                    <Heading mb={0} fontSize={36}>
                        ERC-20 Token Indexer
                    </Heading>
                    <Text>
                        Plug in an address and this website will return all of its ERC-20
                        token balances!
                    </Text>
                </Flex>
            </Center>
            <Flex
                w="100%"
                flexDirection="column"
                alignItems="center"
                justifyContent={'center'}
            >
                <Heading mt={42}>
                    Get all the ERC-20 token balances of this address:
                </Heading>
                <Input
                    onChange={(e) => setUserAddress(e.target.value)}
                    color="black"
                    w="600px"
                    textAlign="center"
                    p={6}
                    bgColor="white"
                    fontSize={16}
                    border="none"
                    disabled={isLoading}
                    borderRadius={5}
                />

                {
                    isLoading ?
                        (
                            <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}><p style={{ margin: "0 auto" }}>Fetching balances</p><div className="lds-dual-ring"></div></div>
                        ) : (
                            <>
                                <Button fontSize={15} onClick={getTokenBalance} mt={15} bgColor="#D5C0FF" color="#000" w={300}>
                                    Check ERC-20 Token Balances
                                </Button>
                                <Button fontSize={15} onClick={getTokenBalance} mt={15} bgColor="#C0D5FF" color="#000" w={300}>
                                    Check YOUR ERC-20 Token Balances
                                </Button>
                            </>
                        )
                }

                <Heading my={36}>ERC-20 token balances:</Heading>

                {hasQueried ? (
                    <SimpleGrid w={'90%'} columns={4} spacing={12} mb={48}>
                        {results.tokenBalances.map((e, i) => {
                            return (
                                <Flex
                                    flexDir={'column'}
                                    color="#000"
                                    bg="blue"
                                    w={'20vw'}
                                    key={e.id}
                                    p={10}
                                    borderRadius={5}
                                    bgColor="#BBBCDE"
                                >
                                    <Box>
                                        <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                                    </Box>
                                    <Box>
                                        <b>Balance:</b>&nbsp;
                                        {parseLargeStrings(Utils.formatUnits(
                                            e.tokenBalance,
                                            tokenDataObjects[i].decimals
                                        ))}
                                    </Box>
                                    <Image src={tokenDataObjects[i].logo} />
                                </Flex>
                            );
                        })}
                    </SimpleGrid>
                ) : (
                    'Please make a query! This may take a few seconds...'
                )}
            </Flex></>
    )
}
