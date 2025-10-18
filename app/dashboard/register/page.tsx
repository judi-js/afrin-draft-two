import { fetchStudents } from '@/app/lib/data';
import Checker from '@/app/ui/checker/checker';

export default async function Page() {
  const students = await fetchStudents();
  
  return (
    <Checker students={students} />
  )
}