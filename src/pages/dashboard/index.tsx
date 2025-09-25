import { type GetServerSideProps } from "next";
import styles from "./styles.module.css";
import { getSession } from "next-auth/react";
import TextArea from "@/components/textarea";

import { FaShare } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { type ChangeEvent, FormEvent, useEffect, useState } from "react";

import { supabase } from "@/services/supabaseClient";

interface UserProps {
    user: {
        email: string
    }
}

interface TaskProps{
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

    useEffect(() => {
        
        getData()
    }, [])

    async function getData() {
            try {
                const { data, error } = await supabase
                    .from("tasks")
                    .select("*")

                if (error) {
                    console.error(error.message)
                }
                console.log(data)
                setTasks(data ?? [])
            } catch (error) {

            }
        }

    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        console.log(e.target.checked)
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
                })

            if (error) {
                console.error(error.message)
            }
            
            setInput("")
            setPublicTask(false)
            getData()

        } catch (error) {
            console.error(error)
        }

    }

    async function handleDeleteTask(id: number){
        try {
            const response = await supabase
                .from("tasks")
                .delete()
                .eq("id", id)
            
            if(response.error){
                console.error(response.error.message)
            }

            getData()
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <main className={styles.main}>
            <section className={styles.container}>
                <div className={styles.containerItems}>
                    <h1 className={styles.title}>Qual a sua tarefa?</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <TextArea
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
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

                            {item.is_public &&(
                                <div className={styles.containerPublicShare}>
                                <span className={styles.public}>PUBLICA</span>
                                <FaShare size={18} color="#3183FF" />
                            </div>
                            )}

                            <div className={styles.containerTextTrash}>
                                <p className={styles.text}>{item.task}</p>
                                <button onClick={()=> handleDeleteTask(item.id)} className={styles.buttonTrash}><FaTrash size={18} className={styles.trashIcon} color="#EA3140" /></button>
                            </div>
                        </div>
                    ))}

                </div>
            </section>
        </main>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });
    console.log(session?.user)

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