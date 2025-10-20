import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  return <footer>
    <Container fluid>
      <Row>
        <Col className="text-center py-3 text-bg-primary">
          © My app {new Date().getFullYear()}
        </Col>
      </Row>
    </Container>
  </footer>;
}