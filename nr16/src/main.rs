use std::fs;
use std::marker::PhantomData;
use std::env;
struct LiteralPacket  {
    version:  u32,
    type_id: u32,
    literal_value:  String
}
struct OperatorPacket {
    version:  u32,
    type_id: u32,
    contains_total_length: bool,
    sub_packets: Vec<Box<dyn Packet>>,
}
trait Packet {
    fn calc_length(&self) -> usize;
    fn get_version_sum(&self) -> u32;
    fn get_type_id(&self)->u32;
    fn calc_value(&self) ->u64;
}
impl Packet for LiteralPacket{
    fn calc_length(&self) -> usize {
        return 3 + 3 + self.literal_value.len();
    }
    fn get_version_sum(&self) -> u32 {
        return self.version;
    }
    fn get_type_id(&self) -> u32 {
        return self.type_id;
    }
    fn calc_value(&self) ->u64 {
        let mut counter=(self.literal_value.len()-1) as i64; 
        let mut result=0;
        let mut power=1;
        let all_chars: Vec<char> = self.literal_value.chars().collect();
            while counter >=0{
            if(counter %5==0){
                counter-=1;
                continue;
            }
            else if all_chars[counter as usize]=='1' {
                result+=power;
            }
            power*=2;
            counter-=1;

        }
        return result;
    }
}
impl Packet for OperatorPacket {
    fn calc_length(&self) -> usize {
        let mut result = 3 + 3 + 1;
        if self.contains_total_length {
            result += 15;
        } else {
            result += 11;
        }
        for p in &self.sub_packets {
            result += p.calc_length()
        }
        return result;
    }
    fn get_version_sum(&self) -> u32 {
        let mut result=self.version;
        for p in &self.sub_packets {
            result += p.get_version_sum()
        }
        return result;
    }
    fn get_type_id(&self) -> u32 {
        return self.type_id;
    }
    fn calc_value(&self) ->u64 {
        let mut lambda:fn(u64,u64)->u64;
        if(self.type_id==0){
            lambda=|x,y|->u64{
                return x+y;
            };
        }
        else if(self.type_id==1){
            lambda=|x,y|->u64{
                return x*y;
            };
        }
        else if(self.type_id==2){
            lambda=|x,y|->u64{
                if(x<y){
                    return x;
                }
                else{
                    return y;
                }
            };
        }
        else if(self.type_id==3){
            lambda=|x,y|->u64{
                if(x>y){
                    return x;
                }
                else{
                    return y;
                }
            };
        }
        else if(self.type_id==5){
            lambda=|x,y|->u64{
                if(x>y){
                    return 1;
                }
                else{
                    return 0;
                }
            };
        }
        else if(self.type_id==6){
            lambda=|x,y|->u64{
                if(x<y){
                    return 1;
                }
                else{
                    return 0;
                }
            };
        }
        else if(self.type_id==7){
            lambda=|x,y|->u64{
                if(x==y){
                    return 1;
                }
                else{
                    return 0;
                }
            };
        }
        else{
            lambda=|x,y|->u64{
                return 0;
            };
        }
        let mut result=self.sub_packets[0].calc_value();
        if(self.sub_packets.len()>1){
            for p in &self.sub_packets[1..self.sub_packets.len()]{
                let val=p.calc_value();
                result=lambda(result,val)
            }
        }
        
        return result;

    }
}

fn parse(path: &str) -> String {
    let contents = fs::read_to_string(path);
    return convert_string_to_binary(&contents.ok().unwrap());
}
fn parse_packet_rec(curr_offset: &mut usize, text: &str,depth:u64)-> Box<dyn Packet> {
    let version = get_number(text, curr_offset, 3) as u32;
    let type_id = get_number(text, curr_offset, 3) as u32;
    println!("{}",version);
    if type_id == 4 {
        let literal_value = parse_literal_packet(&text, curr_offset);
        return Box::new(LiteralPacket{version,type_id,literal_value});
    }
    else{
        let contains_total_length=get_number(text,  curr_offset, 1)==0;
        let mut sub_packets=Vec::new();
        if contains_total_length{
            let total_length=get_number(text,  curr_offset, 15) as usize;
            let end=*curr_offset +total_length;
            while *curr_offset<end{
                sub_packets.push(parse_packet_rec(  curr_offset, text,depth+1));
            }

        }
        else{
            let number_packets=get_number(text,  curr_offset, 11) as usize;
            for i in 0..number_packets{
                sub_packets.push(parse_packet_rec(  curr_offset, text,depth+1));
            }
        }
        return Box::new(OperatorPacket{version,type_id,contains_total_length,sub_packets});

    }
}
fn parse_literal_packet(text: &str, offset: &mut usize) -> String {
    let mut result = String::from("");
    let all_chars: Vec<char> = text.chars().collect();
    let mut index = offset;
    let mut counter=0;
    let mut leave = false;
    while true {
        if counter % 5 == 0 && !leave && all_chars[*index] == '0' {
            leave = true;
        } else if counter % 5 == 0 && leave {
            break;
        }
        result += &String::from(all_chars[*index]);
        counter+=1;
        *index+=1;

    }
    return result;
}

fn get_number(text: &str, offset: &mut usize, length: usize) -> u64 {
    let mut counter:i64 = (*offset + length) as i64-1;
    let mut power = 1;
    let mut result = 0;
    let all_chars: Vec<char> = text.chars().collect();
    while counter >= *offset as i64 {
        let c = all_chars[counter as usize];
        if (c == '1') {
            result += power;
        }
        power *= 2;
        counter -= 1;
    }
    *offset += length;
    return result;
}
fn convert_string_to_binary(content: &str) -> String {
    let mut result = String::from("");
    for c in content.chars() {
        result += &convert_char_to_binary(c)
    }
    return result;
}
fn convert_char_to_binary(c: char) -> String {
    return match c {
        '0' => String::from("0000"),
        '1' => String::from("0001"),
        '2' => String::from("0010"),
        '3' => String::from("0011"),
        '4' => String::from("0100"),
        '5' => String::from("0101"),
        '6' => String::from("0110"),
        '7' => String::from("0111"),
        '8' => String::from("1000"),
        '9' => String::from("1001"),
        'A' => String::from("1010"),
        'B' => String::from("1011"),
        'C' => String::from("1100"),
        'D' => String::from("1101"),
        'E' => String::from("1110"),
        'F' => String::from("1111"),
        _ => String::from(""),
    };
}
fn main() {
   let args:Vec<String>= env::args().collect();
   println!("{} test",args[1]);
    let binary=parse(&args[1]);
    let mut offset=0;
    let task2 =args.len()>2;
    let packet=parse_packet_rec(&mut offset,&binary,0);
    if(task2){
        println!("{}",packet.calc_value());
    }
    else {
        println!("{}",packet.get_version_sum());
    }
    

}
