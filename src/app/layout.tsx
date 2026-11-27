import type {Metadata} from "next";
import "./globals.css";

export const metadata:Metadata={
 title:{default:"نَوَاة | إدارة المحتوى الاجتماعي",template:"%s | نَوَاة"},
 description:"مساحة عمل عربية لتنظيم المحتوى الاجتماعي والوسائط والجدولة الداخلية"
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
