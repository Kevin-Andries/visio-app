// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";

const Contact = () => {
  return (
    <div className="h-screen flex flex-col justify-between">
      <Header />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Contact;
