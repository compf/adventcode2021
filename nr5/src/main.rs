use std::collections::HashMap;
use std::env;
use std::fs;
struct Line {
    x1: i32,
    x2: i32,
    y1: i32,
    y2: i32,
}
fn isHorizontal(line: &Line) -> bool {
    return line.y1 == line.y2;
}
fn isVertical(line: &Line) -> bool {
    return line.x1 == line.x2;
}
fn isHorizontalOrVertical(line: &Line) -> bool {
    return isHorizontal(line) || isVertical(line);
}
fn getDirectionVector(line: &Line) -> (i32, i32) {
    if line.x1 < line.x2 && line.y1 == line.y2 {
        return (1, 0);
    } else if line.x1 < line.x2 && line.y1 < line.y2 {
        return (1, 1);
    } else if line.x1 == line.x2 && line.y1 < line.y2 {
        return (0, 1);
    } else if line.x1 > line.x2 && line.y1 < line.y2 {
        return (-1, 1);
    } else if line.x1 > line.x2 && line.y1 == line.y2 {
        return (-1, 0);
    } else if line.x1 > line.x2 && line.y1 > line.y2 {
        return (-1, -1);
    } else if line.x1 == line.x2 && line.y1 > line.y2 {
        return (0, -1);
    } else if line.x1 < line.x2 && line.y1 > line.y2 {
        return (1, -1);
    } else {
        return (0, 0);
    }
}
fn increment_world_map(x: i32, y: i32, world: &mut HashMap<(i32, i32), i32>) {
    if !world.contains_key(&(x, y)) {
        world.insert((x, y), 1);
    } else {
        world.insert((x, y), world.get(&(x, y)).expect("Error") + 1);
    }
}
fn fillWorld(mut world: &mut HashMap<(i32, i32), i32>, line: &Line) {
    let dir = getDirectionVector(&line);
    let mut x = line.x1;
    let mut y = line.y1;
    //println!("x y {},{} {} {}",line.x1,line.y1,line.x2,line.y2);
    while x != line.x2 || y != line.y2 {
        increment_world_map(x, y, world);
        x += dir.0;
        y += dir.1;
    }
    increment_world_map(x, y, world);
}
fn main() {
    let a = env::args();
    let b = a.skip(1).next().expect("a");
    let content = fs::read_to_string(b).expect("Error");
    let splitted = content.split("\n");
    let mut world: HashMap<(i32, i32), i32> = HashMap::new();
    let mut lines: Vec<Line> = Vec::new();
    for line in splitted {
        if line == "" {
            continue;
        }
        let arrowSplitted: Vec<&str> = line.split("->").collect();

        let xy1 = arrowSplitted[0].trim();
        let xy2 = arrowSplitted[1].trim();

        let mut xy: Vec<&str> = xy1.split(",").collect();
        let x1 = xy[0].parse::<i32>().expect("Error");
        let y1 = xy[1].parse::<i32>().expect("Error");
        xy = xy2.split(",").collect();
        let x2 = xy[0].parse::<i32>().expect("Error");
        let y2 = xy[1].parse::<i32>().expect("Error");
        lines.push(Line {
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
        })
    }
    for line in &lines {
        if (isHorizontalOrVertical(&line)) {
            //println!("{},{}",line.x1,line.y1);
            fillWorld(&mut world, &line)
        }
    }
    for l in &world {
        let key = l.0;
        let val = l.1;

        //println!("{},{} => {}",key.0,key.1,val);
    }
    let mut number = world.values().filter(|x| **x >= 2).count();
    println!("{}", number);
    world.clear();
    for line in &lines {
        fillWorld(&mut world, &line)
    }
    number = world.values().filter(|x| **x >= 2).count();
    println!("{}", number);

}
