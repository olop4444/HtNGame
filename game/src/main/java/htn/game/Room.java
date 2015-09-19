package htn.game;

import com.corundumstudio.socketio.SocketIOClient;

/**
 * Hello world!
 *
 */
public class Room 
{
    public SocketIOClient client1;
    public SocketIOClient client2;
    
    public Room(SocketIOClient client1, SocketIOClient client2) {
    	this.client1 = client1;
    	this.client2 = client2;
    }
    
    public void messageAll(String event, String data) {
    	client1.sendEvent(event, data);
    	client2.sendEvent(event, data);
    }
}
