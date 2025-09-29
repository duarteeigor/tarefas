import { supabase } from "@/services/supabaseClient";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { FaRegTrashAlt } from "react-icons/fa";

import styles from "./styles.module.css"
import TextArea from "@/components/textarea";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface TaskProps {
    id: number,
    task: string,
    created_at: Date | string,
    user_email: string,
    is_public: boolean,
}



interface CommentsProps {
    id: number,
    text: string,
    user_name: string,
    task_id: number,
    user_email: string,
    created_at: Date
}

interface TaskDataFormat {
    taskData: TaskProps,
    comments: CommentsProps[]
}

export default function DetailTask({ taskData, comments }: TaskDataFormat,) {
    
    const [input, setInput] = useState("")
    const [comment, setComment] = useState<CommentsProps[]>(comments)
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(()=> {

        if(status !== "authenticated"){
        router.replace("/")
    }
    },[status])


    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if(input === "") return

        try {
            const { data ,error } = await supabase
            .from("comments")
            .insert({
                text: input,
                user_name: session?.user?.name,
                task_id: taskData.id,
                user_email: session?.user?.email,
                created_at: new Date()
            })
            .select()

            if (error) {
                console.error(error.message)
            }

            setInput("")
            setComment(prev => [data?.[0], ...prev ?? []])

        } catch (error) {
            console.error(error)
        }   
    }

    async function handleDelete(id: number){
        const {data, error} = await supabase
            .from("comments")
            .delete()
            .eq("id", id)
        
        if (error){
            console.error(error.message)
        }

        setComment(prev => prev.filter(item=> item.id !== id))
    }
    return (
        <>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <div className={styles.container}>

                <section className={styles.top_section}>
                    <TextArea
                        readOnly={true}
                        className={styles.text_area}
                        placeholder={taskData.task}
                    />

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h1>Deixar um comentario</h1>
                        <TextArea
                            value={input}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            placeholder="Digite um comentario"
                            className={styles.input_form}
                        />
                        <button className={styles.button} type="submit">Registrar cometario</button>
                    </form>
                </section>

                <section className={styles.bottom_section}>
                    <h1>Todos os comentarios</h1>

                    {comment && (comment.map((item) => (
                        <article key={item.id} className={styles.comments}>
                            <div className={styles.name_trash}>
                                <span className={styles.name}>{item.user_name}</span>
                                {item.user_email === session?.user?.email ? <FaRegTrashAlt onClick={() => handleDelete(item.id)} size={18} color="red" cursor="pointer" /> : ""}
                            </div>
                            <span className={styles.text_comment}>{item.text}</span>
                        </article>
                    )))}
                </section>

            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const query = params

    //This only works if the tasks table has a relashionship with the comments table, if doesnt, it nedded to get another fetch with the comments.    
    const { data, error } = await supabase
        .from("tasks")
        .select('*, comments(*)')
        .eq("id", query?.id)
        .order("created_at", {referencedTable: "comments", ascending: false})

    if (error) {
        console.log(error.message)
    }

    if (data === null) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    if (!data?.[0]?.is_public) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    const taskData: TaskProps = {
        id: data?.[0]?.id,
        task: data?.[0]?.task,
        is_public: data?.[0]?.is_public,
        user_email: data?.[0]?.user_email,
        created_at: new Date(data?.[0].created_at).toLocaleDateString(),
    }

    return {
        props: {
            taskData,
            comments: data?.[0]?.comments
        }
    }
}