import { useSession, signIn, signOut } from "next-auth/react"

import Link from "next/link"
import styles from "./styles.module.css"
import { useRouter } from "next/router"



export default function Header() {
    const router = useRouter()
    const { data: session, status } = useSession()


    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.leftSideHeader}>
                    <Link href={"/"}>
                        <h1 className={styles.title}>Tarefas <span className={styles.icon}>+</span></h1>
                    </Link>

                    {session && (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className={styles.button2}>Meu painel
                        </button>
                    )}
                </div>


                {status === "loading" ? (
                    <></>
                ) : session ? (
                    <button
                        onClick={() => signOut()}
                        className={styles.button}>Olá {session.user?.name?.split(" ")[0] ?? []}
                    </button>
                ) : (
                    <button
                        onClick={() => signIn("google")}
                        className={styles.button}>Acessar
                    </button>
                )}

            </div>
        </header>
    )
}