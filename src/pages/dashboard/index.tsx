import { type GetServerSideProps } from "next";
import styles from "./styles.module.css";
import { getSession, useSession } from "next-auth/react";
import TextArea from "@/components/textarea";

import { FaShare } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { type ChangeEvent, FormEvent, useEffect, useState } from "react";

import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";

interface UserProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: number,
    task: string,
    is_public: boolean,
    user_email: string,
    created_at: Date
}

export default function Dashboard({ user }: UserProps) {
    const [input, setInput] = useState("")
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {

        if (status === "unauthenticated") {
            router.replace("/")
        }


        //FAZENDO FETCH DOS VALORES JA CADASTRADOS NO BANCO

        async function getData() {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_email", user.email)
                .order("created_at", { ascending: false })

            if (error) {
                console.error(error.message)
            }

            setTasks(data ?? [])

        }

        getData()

        //FAZENDO FETCH DAS ALTERACOES COM REALTIME
        const channel = supabase
            .channel("public:tasks")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "tasks",
                    filter: `user_email=eq.${user.email}`
                },
                (payload) => setTasks(prev => [payload.new as TaskProps, ...prev])
            ).on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "tasks"
                },
                (payload) => setTasks(prev => prev.filter(task => task.id !== payload.old.id))
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }


    }, [session])





    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        setPublicTask(e.target.checked)
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (input === "") return;

        try {
            const { error } = await supabase
                .from("tasks")
                .insert({
                    task: input,
                    is_public: publicTask,
                    created_at: new Date(),
                    user_email: user.email
                }).select()

            if (error) {
                console.error(error.message)
            }

            setInput("")
            setPublicTask(false)
            console.log(user)

        } catch (error) {
            console.error(error)
        }

    }

    async function handleDeleteTask(id: number) {
        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", id)
                .select()

            if (error) {
                console.error(error.message)
            }

        } catch (error) {
            console.error(error)
        }
    }

    async function handleCopyUrl(id: number) {
        const url = navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/task/${id}`)

        toast.success("Url copiada com sucesso!", {style: {fontSize: 20}})
    }
    return (
        <main className={styles.main}>
            <section className={styles.container}>
                <div className={styles.containerItems}>
                    <h1 className={styles.title}>Qual a sua tarefa?</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <TextArea
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            value={input}
                            placeholder="Digite uma tarefa..."
                            className={styles.textarea}
                        />
                        <div className={styles.checkboxContainer}>
                            <input
                                className={styles.checkbox}
                                type="checkbox"
                                onChange={handleChangePublic}
                                checked={publicTask}
                            />
                            <label>Deixar tarefa publica?</label>
                        </div>
                        <button className={styles.button} type="submit">Registrar</button>
                    </form>
                </div>
            </section>

            <section className={styles.containerBottom}>
                <div className={styles.containerItemsBottom}>
                    <h1 className={styles.titleBottom}>Minhas tarefas</h1>
                    
                    {tasks.map((item) => (
                        <div key={item.id} className={styles.tasks}>
                            {item.is_public && (
                                <div className={styles.containerPublicShare}>
                                    <span className={styles.public}>PUBLICA</span>
                                    <FaShare onClick={()=>handleCopyUrl(item.id)} size={18} cursor={"pointer"} color="#3183FF" />
                                </div>
                            )}

                            {item.is_public ? (
                                <Link href={`/task/${item.id}`}>
                                    <div className={styles.containerTextTrash}>
                                        <p className={styles.text}>{item.task}</p>
                                        <button onClick={() => handleDeleteTask(item.id)} className={styles.buttonTrash}><FaRegTrashAlt size={18} className={styles.trashIcon} color="#EA3140" /></button>
                                    </div>
                                </Link>
                            ) : (
                                <div className={styles.containerTextTrash}>
                                    <p className={styles.text}>{item.task}</p>
                                    <button onClick={() => handleDeleteTask(item.id)} className={styles.buttonTrash}><FaRegTrashAlt size={18} className={styles.trashIcon} color="#EA3140" /></button>
                                </div>
                            )}

                        </div>
                    ))}

                </div>
            </section>
        </main>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });
    // console.log(session?.user)

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    return {
        props: {
            user: {
                email: session.user.email
            }

        }
    }
}