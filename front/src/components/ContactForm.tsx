import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "../styles/ContactForm.css";

interface MyFormValues {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const FormSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "The first name is too short.")
    .max(20, "The first name is too long.")
    .required("A first name is required."),
  lastName: Yup.string().min(2, "The last name is too short.").max(30, "The last name is too long.").required("A last name is required."),
  message: Yup.string().min(10, "Too short.").max(500, "Too long.").required("Send us your enquiry. "),
  email: Yup.string().email("Invalid email").required("An email address is required."),
});

const ContactForm: React.FC<{}> = () => {
  const [formSent, setFormSent] = useState(false);
  const initialValues: MyFormValues = { firstName: "", lastName: "", email: "", message: "" };

  return (
    <div className="h-full flex flex-col justify-center items-center text-center">
      {formSent ? (
        <div>Form Sent</div>
      ) : (
        <>
          <h1 className="mb-5 text-xl">Contact form</h1>
          <Formik
            initialValues={initialValues}
            validationSchema={FormSchema}
            onSubmit={(values, actions) => {
              console.log(values);
              console.log(actions);
              alert(JSON.stringify(values));
              actions.setSubmitting(false);
              setFormSent(true);
            }}>
            {({ errors }) => (
              <Form className="flex flex-col text-left w-2/4">
                <div className="flex flex-col mb-4">
                  <label htmlFor="firstName" className="text-xs mb-1">
                    First Name
                  </label>
                  <Field id="firstName" name="firstName" placeholder="First Name" className="mb-1" />
                  {errors.firstName && <div className="text-red-600 text-xs">{errors.firstName}</div>}
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="lastName" className="text-xs mb-1">
                    Last Name
                  </label>
                  <Field id="lastName" name="lastName" placeholder="Last Name" className="mb-1" />
                  {errors.lastName && <div className="text-red-600 text-xs">{errors.lastName}</div>}
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="email" className="text-xs mb-1">
                    Email
                  </label>
                  <Field id="email" name="email" placeholder="Email" className="mb-1" />
                  {errors.email && <div className="text-red-600 text-xs">{errors.email}</div>}
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="message" className="text-xs mb-1">
                    Message
                  </label>
                  <Field id="message" name="message" placeholder="Your message" className="mb-1" />
                  {errors.message && <div className="text-red-600 text-xs">{errors.message}</div>}
                </div>

                <button type="submit" className="text-white bg-blue-600 font-light text-xl rounded-lg p-2 px-8 shadow-xl">
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default ContactForm;
