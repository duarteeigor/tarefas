import { supabase } from "@/services/supabaseClient";
import { type GetServerSideProps } from "next";
import Head from "next/head";

import styles from "./styles.module.css"

interface TaskProps {
    id: number,
    task: string,
    created_at: Date | string,
    user_email: string,
    is_public: boolean
}

interface TaskDataFormat{
    taskData: TaskProps
}

export default function DetailTask( {taskData}: TaskDataFormat) {
    console.log(taskData)
    return (
        <>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <div className="container">
                <h1>{taskData.task}</h1>
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const query = params

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", query?.id)

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
        is_public: data?.[0].is_public,
        user_email: data?.[0].user_email,
        created_at: new Date(data?.[0].created_at).toLocaleDateString()
    }
    return {
        props: {
            taskData
        }
    }
}