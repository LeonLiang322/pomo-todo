import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

interface ToastOptions {
    title?: string;
    description: string;
}

const msgToaster = (msg: string, title?: string): void => {
    const toastOptions: ToastOptions = {
        description: msg,
    };
    if (title) toastOptions.title = title;
    console.log('aaa')
    toast(toastOptions);
};

export default msgToaster;
