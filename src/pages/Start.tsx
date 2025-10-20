import { Row, Col } from 'react-bootstrap';

Start.route = {
  path: '/',
  menuLabel: 'Start',
  index: 1
}

export default function Start() {
  return <Row>
    <Col>
      <h2>My start page</h2>
      <p>The start page of my application. Change soon.</p>
    </Col>
  </Row>
}