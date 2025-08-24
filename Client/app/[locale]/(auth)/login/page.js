"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardBody, Input, Button } from "@nextui-org/react";
import { TbEye, TbEyeClosed, TbLock, TbMail } from "react-icons/tb";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next13-progressbar";
import Loading from "@/components/Loading";
import { useTranslations } from "next-intl";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";
import Link from "next/link";

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const toggleVisibility = () => setIsVisible(!isVisible);
  const t = useTranslations("Login");

  const validationSchema = Yup.object({
    email: Yup.string().email(t("emailValid")).required(t("emailRequired")),
    password: Yup.string()
      .min(4, t("minLength"))
      .required(t("passwordRequired")),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const { email: emailAddress, password } = values;
    if (!isLoaded) return;

    try {
      setLoading(true);
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
      }
    } catch (err) {
      console.error("error", err.errors?.[0]?.longMessage);
      setError(err.errors?.[0]?.message || "Giriş başarısız oldu");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!isLoaded) return <Loading />;

  return (
    <div className="mt-20 flex items-center justify-center flex-col">
      <Card className="w-11/12 md:w-[400px] lg:w-[450px]">
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleBlur,
            handleChange,
            errors,
            touched,
            values,
            isSubmitting,
            isValid,
          }) => (
            <Form>
              <CardHeader className="flex justify-center">
                <p className="text-lg font-bold">{t("title")}</p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-6">
                  <Input
                    name="email"
                    label={t("email")}
                    size="lg"
                    placeholder="johndoe@example.com"
                    labelPlacement="outside"
                    validationState={
                      errors.email && touched.email ? "invalid" : "valid"
                    }
                    errorMessage={errors.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    startContent={
                      <TbMail className="text-2xl text-default-400" />
                    }
                  />

                  <Input
                    label={t("password")}
                    name="password"
                    labelPlacement="outside"
                    size="lg"
                    placeholder="**********"
                    validationState={
                      errors.password && touched.password ? "invalid" : "valid"
                    }
                    errorMessage={errors.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    startContent={<TbLock className="text-2xl text-default-400" />}
                    endContent={
                      <button
                        type="button"
                        onClick={toggleVisibility}
                        className="focus:outline-none"
                      >
                        {isVisible ? (
                          <TbEyeClosed className="text-2xl text-default-400" />
                        ) : (
                          <TbEye className="text-2xl text-default-400" />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
                  />
                </div>

                <Button
                  type="submit"
                  color="secondary"
                  className="mt-6 w-full"
                  isDisabled={
                    !isValid ||
                    isSubmitting ||
                    values.email === "" ||
                    values.password === ""
                  }
                  isLoading={loading}
                >
                  {t("title")}
                </Button>

                <div className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-gray-400"></div>
                  <span className="flex-shrink mx-4 text-gray-400">
                    {t("or")}
                  </span>
                  <div className="flex-grow border-t border-gray-400"></div>
                </div>

                <SignInOAuthButtons />
              </CardBody>

              {error && (
                <div className="mt-2 text-sm text-center text-red-500">
                  {error}
                </div>
              )}
            </Form>
          )}
        </Formik>
      </Card>

      <div className="mt-4 text-center">
        <span className="text-gray-500">Hesabınız yok mu? </span>
        <Link href={`/register`} className="text-secondary underline">
          Kayıt olun
        </Link>
      </div>
    </div>
  ); 
}
