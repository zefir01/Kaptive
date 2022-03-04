import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {usePapaParse} from 'react-papaparse';
import {Col, Container, ListGroup, Row, Spinner} from "react-bootstrap";


function App() {
    const {readString} = usePapaParse();
    const [data, setData] = useState<Array<[string, number, number, number, number]> | null>(null);
    const [years, setYears] = useState<Array<number> | null>(null);
    const [users, setUsers] = useState<Array<string> | null>(null);
    const [products, setProducts] = useState<Array<number> | null>(null);
    const [running, setRunning] = useState(false);
    const [selectedYears, setSelectedYears] = useState<Array<number>>([]);
    const [selectedUsers, setSelectedUsers] = useState<Array<string>>([]);
    const [selectedProducts, setSelectedProducts] = useState<Array<number>>([]);


    useEffect(() => {
        async function f() {
            if (running || data) {
                return;
            }
            setRunning(true);
            try {
                const text = await fetch("user_product_data.csv").then(resp => resp.text());
                readString(text, {
                    worker: true,
                    complete: (results) => {
                        results.data.splice(0, 1);

                        let data = results.data.filter(p => (p as string).length > 1).map(p => {
                            let x: [string, number, number, number, number];
                            // @ts-ignore
                            x = [p[0], Number(p[1]), Number(p[2]), Number(p[3]), Number(p[4])];
                            return x;
                        });

                        let years = new Set(data.map(p => p[1]));
                        let users = new Set(data.map(p => p[0]));
                        let products = new Set(data.map(p => p[3]));
                        setYears(Array.from(years));
                        setUsers(Array.from(users));
                        setProducts(Array.from(products));

                        setData(data);

                    },
                });
            } catch {
                setRunning(false);
            }
        }

        f();
    });

    const meanCb = useCallback(() => {
        if (!data || selectedUsers.length === 0 || selectedYears.length === 0 || selectedProducts.length === 0) {
            return "";
        }
        const selected = data.filter(p => {
            let pass = true;
            if (!selectedUsers.includes(p[0])) {
                pass = false;
            }
            if (!selectedYears.includes(p[1])) {
                pass = false;
            }
            if (!selectedProducts.includes(p[3])) {
                pass = false;
            }
            return pass;
        });
        const sum = selected.map(p => p[4]).reduce((a, b) => a + b, 0);
        const avg = (sum / selected.length) || 0;
        return avg.toString();
    }, [selectedProducts, selectedYears, selectedUsers, data])
    const mean = meanCb();

    if (!data || !users || !years || !products) {
        return (
            <div className="App">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        )
    }

    return (
        <div className="App">
            <Container>
                <Row>
                    <Col>
                        <ListGroup>
                            <ListGroup.Item active>
                                Users
                            </ListGroup.Item>
                            {users.sort((a, b) => a.localeCompare(b)).map(p =>
                                <ListGroup.Item key={"user" + p}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" onChange={() => {
                                            let i = selectedUsers.indexOf(p);
                                            if (i === -1) {
                                                selectedUsers.push(p);
                                                setSelectedUsers(Array.from(selectedUsers));
                                            } else {
                                                selectedUsers.splice(i, 1);
                                                setSelectedUsers(Array.from(selectedUsers));
                                            }
                                        }}/>
                                        <label className="form-check-label">
                                            {p}
                                        </label>
                                    </div>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                    <Col>
                        <ListGroup>
                            <ListGroup.Item active>
                                Years
                            </ListGroup.Item>
                            {years.sort((n1, n2) => n1 - n2).map(p =>
                                <ListGroup.Item key={"year" + p}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" onChange={() => {
                                            let i = selectedYears.indexOf(p);
                                            if (i === -1) {
                                                selectedYears.push(p);
                                                setSelectedYears(Array.from(selectedYears));
                                            } else {
                                                selectedYears.splice(i, 1);
                                                setSelectedYears(Array.from(selectedYears));
                                            }
                                        }}/>
                                        <label className="form-check-label">
                                            {p}
                                        </label>
                                    </div>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                    <Col>
                        <ListGroup>
                            <ListGroup.Item active>
                                Products
                            </ListGroup.Item>
                            {products.sort((n1, n2) => n1 - n2).map(p =>
                                <ListGroup.Item key={"product" + p}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" onChange={() => {
                                            let i = selectedProducts.indexOf(p);
                                            if (i === -1) {
                                                selectedProducts.push(p);
                                                setSelectedProducts(Array.from(selectedProducts));
                                            } else {
                                                selectedProducts.splice(i, 1);
                                                setSelectedProducts(Array.from(selectedProducts));
                                            }
                                        }}/>
                                        <label className="form-check-label">
                                            {p}
                                        </label>
                                    </div>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                </Row>
                {mean.length > 0 ?
                    <Row className="justify-content-center">
                        <Col className="col-auto">
                            <p className="fs-3">Mean score: {mean}</p>
                        </Col>
                    </Row>
                    : null
                }
            </Container>
        </div>
    );
}

export default App;