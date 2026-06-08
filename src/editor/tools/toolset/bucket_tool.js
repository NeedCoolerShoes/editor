import Color from "color";
import { BaseTool } from "../base_tool.js";

const TRANSPARENT_COLOR = new Color("#000000").alpha(0);

class BucketTool extends BaseTool {
  constructor(config) {
    super(config, {
      id: "bucket",
      icon: "bucket",
      name: "Paint Bucket [G]",
      description: "Simple tool for filling large closed areas with a specific color.\nUse the left mouse button to fill, and the right mouse button to erase.",
      providesColor: true, // Whether or not drawing with this tool adds to recent colors.
      desktopLayout: true,
      mobileLayout: true,
    });
  }

  cursor = { x: 0, y: 0 };
  replaceColor = false;
  lastPart;
  lastFace;
  _unsetEraseOnUp = false;

  down(toolData) {
    this._checkErase(toolData);

    const texture = toolData.texture;
    const point = toolData.getCoords();
    const color = this.config.get("bucketErase", false) ? () => TRANSPARENT_COLOR : this.config.getColor.bind(this.config);
    const old_color = toolData.texture.getPixel({ x: point.x, y: point.y });

    this.replaceColor = this.config.get("fillStyle")=="replace-color";
    this.cubeUV = this.config.get("fillStyle")=="fill-cube-connected" || this.config.get("fillStyle")=="fill-cube-replace";
    this.replaceWithColor = this.config.get("fillStyle")=="fill-cube-replace"||this.config.get("fillStyle")=="fill-face-replace";

    this.cursor = point;
    if (!this.replaceColor) {
      if (this.isInArea(point,0,8,31,15)||this.isInArea(point,8,0,23,7)) {
        this.draw_head_inner(texture, point, color, old_color);
      }
      if (this.isInArea(point,32,8,63,15)||this.isInArea(point,40,0,55,7)) {
        this.draw_head_outer(texture, point, color, old_color);
      }
      if (this.isInArea(point,20,16,35,19)||this.isInArea(point,16,20,39,31)) {
        this.draw_torso_inner(texture, point, color, old_color);
      }
      if (this.isInArea(point,20,32,35,35)||this.isInArea(point,16,36,39,47)) {
        this.draw_torso_outer(texture, point, color, old_color);
      }

      if (toolData.variant=='classic'&&(this.isInArea(point,44,16,51,19)||this.isInArea(point,40,20,55,31))) {
        this.draw_right_arm_inner_classic(texture, point, color, old_color);
      }
      if (toolData.variant=='classic'&&(this.isInArea(point,44,32,51,35)||this.isInArea(point,40,36,55,47))) {
        this.draw_right_arm_outer_classic(texture, point, color, old_color);
      }
      if (toolData.variant=='classic'&&(this.isInArea(point,36,48,43,51)||this.isInArea(point,32,52,47,63))) {
        this.draw_left_arm_inner_classic(texture, point, color, old_color);
      }
      if (toolData.variant=='classic'&&(this.isInArea(point,52,48,59,51)||this.isInArea(point,48,52,63,63))) {
        this.draw_left_arm_outer_classic(texture, point, color, old_color);
      }

      if (toolData.variant=='slim'&&(this.isInArea(point,44,16,49,19)||this.isInArea(point,40,20,53,31))) {
        this.draw_right_arm_inner_slim(texture, point, color, old_color);
      }
      if (toolData.variant=='slim'&&(this.isInArea(point,44,32,49,35)||this.isInArea(point,40,36,53,47))) {
        this.draw_right_arm_outer_slim(texture, point, color, old_color);
      }
      if (toolData.variant=='slim'&&(this.isInArea(point,36,48,41,51)||this.isInArea(point,32,52,45,63))) {
        this.draw_left_arm_inner_slim(texture, point, color, old_color);
      }
      if (toolData.variant=='slim'&&(this.isInArea(point,52,48,57,51)||this.isInArea(point,48,52,61,63))) {
        this.draw_left_arm_outer_slim(texture, point, color, old_color);
      }

      if ((this.isInArea(point,4,16,11,19)||this.isInArea(point,0,20,15,31))) {
        this.draw_right_leg_inner(texture, point, color, old_color);
      }
      if ((this.isInArea(point,4,32,11,35)||this.isInArea(point,0,36,15,47))) {
        this.draw_right_leg_outer(texture, point, color, old_color);
      }
      if ((this.isInArea(point,20,48,27,61)||this.isInArea(point,16,52,31,63))) {
        this.draw_left_leg_inner(texture, point, color, old_color);
      }
      if ((this.isInArea(point,4,48,11,61)||this.isInArea(point,0,52,15,63))) {
        this.draw_left_leg_outer(texture, point, color, old_color);
      }

      if ((this.isInArea(point,25,0,36,0)||this.isInArea(point,24,1,37,6))) {
        this.draw_ears(texture, point, color, old_color);
      }
    } else {
        this.draw_replace_color(texture, color, old_color);
    }

    return texture.toTexture();
  }

  move(toolData) {
    this._checkErase(toolData);
    const texture = toolData.texture;
    return texture.toTexture();
  }

  up() {
    super.up();

    if (this._unsetEraseOnUp) {
      this.config.set("bucketErase", false);
      this._unsetEraseOnUp = false;
    }
  }

  draw_replace_color(texture, color, old_color){
    const width = 64;
    const height = 64;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.colorsMatch(texture.getPixel({ x, y }), old_color) && (((x+8)%32>=16&&y>=0&&y<=7) || (y>=8&&y<=15) || (x>=4&&x<=11&&y>=16) || (x>=20&&x<=35&&y>=16&&y<=35) || (x>=44&&x<=51&&y>=16&&y<=35) || (x>=0&&x<=55&&y>=20&&y<=31) || (x>=0&&x<=55&&y>=36&&y<=47) || ((x+4)%16>=8&&y>=48) || y>=52 )) {
          texture.putPixel({ x, y }, color());
        }
      }
    }
  }

  draw_box_uv(box_width, box_height, box_depth, offset_x, offset_y, texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.canvas.width;
    const height = texture.canvas.height;
    let queue_length;
    let previous_queue_legth;

    for (let i = 0; i<((box_width*box_height*2)+(box_width*box_depth*2)+(box_height*box_depth*2)); i++) {
      queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);

        if (this.cubeUV) {
          // The lines below limit the bucket tool from spilling over to other limbs and parts of the cube that aren't physically connected
          this.UV(x+1<=width&&!((x==(offset_x+box_depth+box_width-1)&&y>=offset_y&&y<=(offset_y+box_depth-1))||(x==(offset_x+box_depth+(box_width*2)-1)&&y>=offset_y&&y<=(offset_y+box_depth-1))||(x==(offset_x+(box_depth*2)+(box_width*2)-1)&&y>=(offset_y+box_depth)&&y<=(offset_y+box_depth+box_height-1))), { x: x + 1, y },texture,old_color,queue);
          this.UV(x-1>=0&&!((x==(offset_x+box_depth)&&y>=(offset_y)&&y<=(offset_y+box_depth-1))||(x==(offset_x+box_depth+box_width)&&y>=(offset_y)&&y<=(offset_y+box_depth-1))||(x==offset_x&&y>=(offset_y+box_depth)&&y<=(offset_y+box_depth+box_height-1))), { x: x - 1, y },texture,old_color,queue);
          this.UV(y+1<=height&&!((y==(offset_y+box_depth-1)&&x>=(offset_x+box_depth+box_width)&&x<=(offset_x+box_depth+(box_width*2)-1))||(y==(offset_y+box_depth+box_height-1)&&x>=offset_x&&x<=(offset_x+(box_width*2)+(box_depth*2)-1))), { x, y: y + 1 },texture,old_color,queue);
          this.UV(y-1>=0&&!((y==offset_y&&x>=(offset_x+box_depth)&&x<=(offset_x+box_depth+box_width*2))||(y==(offset_y+box_depth)&&x>=offset_x&&x<=(offset_x+box_depth-1))||(y==(offset_y+box_depth)&&x>=(offset_x+box_depth+box_width)&&x<=(offset_x+(box_depth*2)+(box_width*2)-1))), { x, y: y - 1 },texture,old_color,queue);

          // Left-Right UV
          this.UV(x==offset_x&&y>=(offset_y+box_depth)&&y<=(offset_y+box_depth+box_height-1), { x: (offset_x+(box_depth*2)+(box_width*2)-1), y },texture,old_color,queue);
          this.UV(x==(offset_x+(box_depth*2)+(box_width*2)-1)&&y>=(offset_y+box_depth)&&y<=(offset_y+box_depth+box_height-1), { x: offset_x, y },texture,old_color,queue);
          // 1st Top UV
          this.UV(x>=offset_x&&x<=(offset_x+box_depth)&&y==(offset_y+box_depth), { x: (offset_x+box_depth), y: (offset_y+(x-offset_x)) },texture,old_color,queue);
          this.UV(y>=offset_y&&y<=(offset_y+box_depth-1)&&x==(offset_x+box_depth), { x: (offset_x+(y-offset_y)), y: (offset_y+box_depth) },texture,old_color,queue);
          // 2nd Top UV
          this.UV(x>=(offset_x+box_depth+box_width)&&x<=(offset_x+(box_depth*2)+box_width-1)&&y==(offset_y+box_depth), { x: (offset_x+box_depth+box_width-1), y: (offset_y+((offset_x+(box_depth*2)+box_width-1)-x)) },texture,old_color,queue);
          this.UV(y>=offset_y&&y<=(offset_y+box_depth)&&x==(offset_x+box_depth+box_width-1), { x: (offset_x+((offset_y+(box_depth*2)+box_width-1)-y)), y: (offset_y+box_depth) },texture,old_color,queue);
          // 3rd Top UV
          this.UV(y==(offset_y+box_depth)&&x>=(offset_x+(box_depth*2)+box_width)&&x<=(offset_x+(box_depth*2)+(box_width*2)), { x: (offset_x*2+box_depth*3+box_width*2-x-1), y: offset_y },texture,old_color,queue);
          this.UV(y==offset_y&&x>=(offset_x+box_depth)&&x<=(offset_x+box_depth+box_width-1), { x: ((offset_x*2)+(box_depth*3)+(box_width*2)-x-1), y: (offset_y+box_depth) },texture,old_color,queue);
          // 1st Bottom UV
          this.UV(y==(offset_y+box_depth+box_height-1)&&x>=offset_x&&x<=(offset_x+box_depth-1), { x: (offset_x+box_depth+box_width), y: (offset_y+(x-offset_x)) },texture,old_color,queue);
          this.UV(x==(offset_x+box_depth+box_width)&&y>=offset_y&&y<=(offset_y+box_depth-1), { x: (offset_x+(y-offset_y)), y: (offset_y+box_depth+box_height-1) },texture,old_color,queue);
          // 2nd Bottom UV
          this.UV(y==(offset_y+box_depth+box_height-1)&&x>=(offset_x+box_depth)&&x<=(offset_x+box_depth+box_width-1), { x: (x+(box_width)), y: (offset_y+box_depth-1) },texture,old_color,queue);
          this.UV(y==(offset_y+box_depth-1)&&x>=(offset_x+box_depth+box_width)&&x<=(offset_x+box_depth+(box_width*2)-1), { x: (x-(box_width)), y: (offset_y+box_depth+box_height-1) },texture,old_color,queue);
          // 3rd Bottom UV
          this.UV(y==(offset_y+box_depth+box_height-1)&&x>=(offset_x+box_depth+box_width)&&x<=(offset_x+(box_depth*2)+box_width-1), { x: (offset_x+box_depth+box_width*2-1), y: (offset_y+(offset_x+box_depth*2+box_width-x-1)) },texture,old_color,queue);
          this.UV(x==(offset_x+box_depth+box_width*2-1)&&y>=offset_y&&y<=(offset_y+box_depth-1), { x: (offset_x+box_depth*2+box_width+(offset_y-y-1)), y: (offset_y+box_depth+box_height-1) },texture,old_color,queue);
          // 4th Bottom UV
          this.UV(y==(offset_y+box_depth+box_height-1)&&x>=(offset_x+box_depth*2+box_width)&&x<=(offset_x+(box_depth*2)+(box_width*2)-1), { x: (offset_x*2 + box_depth*3 + box_width*3 - x - 1), y: offset_y },texture,old_color,queue);
          this.UV(y==offset_y&&x>=(offset_x+box_depth+box_width)&&x<=(offset_x+box_depth+box_width*2-1), { x: (offset_x*2 + box_depth*3 + box_width*3 - x - 1), y: (offset_y+box_depth+box_height-1) },texture,old_color,queue);
        } else {
          this.UV(x+1<=width&&!((x==(offset_x+box_depth-1)&&y>=(offset_y+box_depth))||(x==(offset_x+box_depth+box_width-1))||(x==(offset_x+box_depth+box_width*2-1)&&y<(offset_y+box_depth))||(x==(offset_x+box_depth*2+box_width-1)&&y>=(offset_y+box_depth))||(x==(offset_x+box_depth*2+box_width*2-1))), { x: x + 1, y },texture,old_color,queue);
          this.UV(x-1>=0&&!((x==(offset_x))||(x==(offset_x+box_depth))||(x==(offset_x+box_depth+box_width)||(x==(offset_x+box_depth*2+box_width))&&(y>=(offset_y+box_depth)))), { x: x - 1, y },texture,old_color,queue);
          this.UV(y+1<=height&&!(y==(offset_y+box_depth-1)||(y==(offset_y+box_depth+box_height-1))), { x, y: y + 1 },texture,old_color,queue);
          this.UV(y-1>=0&&!((y==(offset_y)||y==(offset_y+box_depth))), { x, y: y - 1 },texture,old_color,queue);
        }
      }
      if (previous_queue_legth === queue.length){
        break;
      }
      previous_queue_legth = queue.length;
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_head_inner(texture, point, color, old_color) {
    this.draw_box_uv(8, 8, 8, 0, 0, texture, point, color, old_color);
  }

  draw_head_outer(texture, point, color, old_color) {
    this.draw_box_uv(8, 8, 8, 32, 0, texture, point, color, old_color);
  }

  draw_torso_inner(texture, point, color, old_color) {
    this.draw_box_uv(8, 12, 4, 16, 16, texture, point, color, old_color);
  }
  
  draw_torso_outer(texture, point, color, old_color) {
    this.draw_box_uv(8, 12, 4, 16, 32, texture, point, color, old_color);
  }

  draw_right_arm_inner_classic(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 40, 16, texture, point, color, old_color);
  }

  draw_right_arm_outer_classic(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 40, 32, texture, point, color, old_color);
  }

  draw_left_arm_inner_classic(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 32, 48, texture, point, color, old_color);
  }

  draw_left_arm_outer_classic(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 48, 48, texture, point, color, old_color);
  }

  draw_right_arm_inner_slim(texture, point, color, old_color) {
    this.draw_box_uv(3, 12, 4, 40, 16, texture, point, color, old_color);
  }

  draw_right_arm_outer_slim(texture, point, color, old_color) {
    this.draw_box_uv(3, 12, 4, 40, 32, texture, point, color, old_color);
  }

  draw_left_arm_inner_slim(texture, point, color, old_color) {
    this.draw_box_uv(3, 12, 4, 32, 48, texture, point, color, old_color);
  }

  draw_left_arm_outer_slim(texture, point, color, old_color) {
    this.draw_box_uv(3, 12, 4, 48, 48, texture, point, color, old_color);
  }

  draw_right_leg_inner(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 0, 16, texture, point, color, old_color);
  }

  draw_right_leg_outer(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 0, 32, texture, point, color, old_color);
  }

  draw_left_leg_inner(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 16, 48, texture, point, color, old_color);
  }

  draw_left_leg_outer(texture, point, color, old_color) {
    this.draw_box_uv(4, 12, 4, 0, 48, texture, point, color, old_color);
  }


  draw_ears(texture, point, color, old_color) {
    this.draw_box_uv(6, 6, 1, 24, 0, texture, point, color, old_color);
  }


  
  colorsMatch(c1, c2) {
    const tolerance = 0.01*255;
    const alpha_tolerance = 0.05;
    return (
      c1 && c2 &&
      c1.red()-tolerance <= c2.red() && c1.red()+tolerance >= c2.red() &&
      c1.green()-tolerance <= c2.green() && c1.green()+tolerance >= c2.green() &&
      c1.blue()-tolerance <= c2.blue() && c1.blue()+tolerance >= c2.blue() &&
      c1.alpha()-alpha_tolerance <= c2.alpha() && c1.alpha()+alpha_tolerance >= c2.alpha() 
    );
  }

  isInArea(point,x,y,end_x,end_y){
    return (point.x>=x&&point.x<=end_x&&point.y>=y&&point.y<=end_y);
  }

  UV(area,move_to,texture,old_color,queue){
    if (area&&(this.colorsMatch(texture.getPixel(move_to), old_color)||this.replaceWithColor)&&!queue.includes(move_to)) {
      queue.push(move_to);
    }
  }

  _checkErase(toolData) {
    if (this._unsetEraseOnUp || this.config.get("bucketErase", false)) return;
    if (toolData.button !== 2) return;

    this.config.set("bucketErase", true);
    this._unsetEraseOnUp = true;
  }
}

export default BucketTool;
