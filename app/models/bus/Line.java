package models.bus;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.jongo.marshall.jackson.oid.ObjectId;

import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: djey
 * Date: 09/06/13
 * Time: 01:47
 * To change this template use File | Settings | File Templates.
 */
@Deprecated
public class Line {
    public static final List<String> IGNORED_LINES = Arrays.asList(
            "512", "537", "597", "MONTBUS", "NAVETTE", "ORLYBUS", "ROISSYB"
    );

    @ObjectId
    public String _id;
    @JsonProperty("line_name")
    public String fullName;
    @JsonProperty("stop_int_id")
    public long stopInternalId;

    public String code;
    public String name;

    public void setCodeAndName() {
        code = fullName.split(" ")[0];
        name = fullName.substring(code.length() + 1);
    }
}